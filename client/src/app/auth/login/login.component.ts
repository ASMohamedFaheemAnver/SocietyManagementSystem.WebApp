import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;

  isLoading = false;

  private authStatusSub: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(emittedBoolean => {
        this.isLoading = emittedBoolean;
      });

    this.form = new FormGroup({
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email]
      }),
      category: new FormControl(null, { validators: [Validators.required] }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)]
      })
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  onLogin() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;

    this.authService.loginUser(
      this.form.value.email,
      this.form.value.category,
      this.form.value.password
    );
  }
}
