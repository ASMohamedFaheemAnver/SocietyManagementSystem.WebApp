import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";

import { mimeType } from "../../util/mime-type.validator";

@Component({
  selector: "app-signup-society",
  templateUrl: "./signup-society.component.html",
  styleUrls: ["./signup-society.component.css"],
})
export class SignupSocietyComponent implements OnInit {
  form: FormGroup;

  isLoading = false;
  hide = true;

  imageUrl: any = "./assets/img/add-img.png";

  private authStatusSub: Subscription;

  private phoneNumberPattern = "[+]*[0-9]{3,13}";
  private regIdPattern = "([0-9]|[a-z]|[A-Z]){3,10}";

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((emittedBoolean) => {
        this.isLoading = emittedBoolean;
      });

    this.form = new FormGroup({
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
      regNo: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.pattern(this.regIdPattern),
        ],
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
    this.authService.createSociety(
      this.form.value.email,
      this.form.value.name,
      this.form.value.password,
      this.form.value.image,
      this.form.value.address,
      this.form.value.regNo,
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
        console.log("ON_UPLOAD_EXIT");
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
