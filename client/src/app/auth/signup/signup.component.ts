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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(emittedBoolean => {
        this.isLoading = emittedBoolean;
      });

    this.form = new FormGroup({
      image: new FormControl(null, { validators: [Validators.required] }),
      name: new FormControl(null, { validators: [Validators.required] }),
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email]
      }),
      category: new FormControl(null, { validators: [Validators.required] }),
      address: new FormControl(null, { validators: [Validators.required] }),
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

    this.authService.createUser(
      this.form.value.email,
      this.form.value.name,
      this.form.value.password,
      this.form.value.image,
      this.form.value.address,
      this.form.value.category
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
