import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { ErrorComponent } from "src/app/error/error.component";
import { mimeType } from "../../util/mime-type.validator";

@Component({
  selector: "app-signup-member",
  templateUrl: "./signup-member.component.html",
  styleUrls: ["./signup-member.component.css"],
})
export class SignupMemberComponent implements OnInit, OnDestroy {
  form: FormGroup;

  isLoading = false;

  imageUrl: any = "./assets/img/add-img.png";

  private authStatusSub: Subscription;

  societies = [];

  private phoneNumberPattern = "[+]*[0-9]{3,13}";

  constructor(private authService: AuthService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((emittedBoolean) => {
        this.isLoading = emittedBoolean;
      });
    this.authService.getBasicSocietyDetailes().subscribe(
      (res) => {
        this.societies = res["data"]["getBasicSocietyDetailes"];
        this.isLoading = false;
      },
      (err) => {
        console.log(err);
        this.isLoading = false;
      }
    );

    this.form = new FormGroup({
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
      societyId: new FormControl(null, {
        validators: [Validators.required],
      }),
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email],
      }),
      address: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(10)],
      }),
      phoneNumber: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.pattern(this.phoneNumberPattern),
        ],
      }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  onSignUp() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createMember(
      this.form.value.email,
      this.form.value.name,
      this.form.value.password,
      this.form.value.image,
      this.form.value.address,
      this.form.value.societyId,
      this.form.value.phoneNumber
    );
  }

  onImageUpload(event: Event) {
    const file: File = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();

    this.form.get("image").statusChanges.subscribe((_) => {
      // console.log(this.form.get("image").errors);
      console.log(!this.form.get("image").valid);
      console.log("ON_UPLOAD");
      if (!this.form.get("image").valid) {
        this.imageUrl = "./assets/img/invalid-img.jpg";
        // console.log(this.imageUrl);
        return;
      }

      console.log("ON_UPLOAD_PASS");

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        console.log("ON_UPLOAD_ON_LOAD");
        this.imageUrl = reader.result;
      };
    });
  }
}
