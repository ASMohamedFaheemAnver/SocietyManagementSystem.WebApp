import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"]
})
export class SignupComponent implements OnInit, OnDestroy {
  form: FormGroup;

  isLoading = false;

  imageUrl: any =
    "https://icons-for-free.com/iconfiles/png/512/add+profile+seo+user+icon-1320191017476245273.png";

  private authStatusSub: Subscription;

  societies = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(emittedBoolean => {
        this.isLoading = emittedBoolean;
      });
    this.authService.getBasicSocietyDetailes().subscribe(res => {
      this.societies = res["data"].getBasicSocietyDetailes;
      console.log(this.societies);
    });

    this.form = new FormGroup({
      image: new FormControl(null, { validators: [Validators.required] }),
      societyId: new FormControl(null, { validators: [Validators.required] }),
      name: new FormControl(null, { validators: [Validators.required] }),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email]
      }),
      address: new FormControl(null, { validators: [Validators.required] }),
      phoneNumber: new FormControl(null, { validators: [Validators.required] }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)]
      })
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  onSignUp() {
    if (this.form.invalid) {
      return;
    }

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

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      this.imageUrl = reader.result;
    };
  }
}
