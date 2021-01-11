import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { PasswordResetSnackComponent } from "src/app/common/snackbars/password-reset.component";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: "enter-email-dialog.component.html",
  styleUrls: ["enter-email-dialog.component.css"],
})
export class EnterEmailDialogComponent implements OnInit {
  form: FormGroup;

  isLoading = false;
  hide = true;

  signUpLink = "/auth/signup-member";

  private authStatusSub: Subscription;
  private authPasswordResetStatusSub: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialogRef<EnterEmailDialogComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.authService.isUserAuth()) {
      this.router.navigateByUrl(`/${this.authService.getUserCategory()}/home`);
    }
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((emittedBoolean) => {
        this.isLoading = false;
      });

    this.authPasswordResetStatusSub = this.authService
      .getresetPasswordStatusListenner()
      .subscribe((emittedBoolean) => {
        this.matDialog.close();
        this.snackBar.openFromComponent(PasswordResetSnackComponent, {
          duration: 10000,
        });
      });

    this.form = new FormGroup({
      email: new FormControl(null, {
        validators: [Validators.required, Validators.email],
      }),
      category: new FormControl(null, { validators: [Validators.required] }),
    });

    this.form.patchValue({ category: "member" });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.authPasswordResetStatusSub.unsubscribe();
  }

  onChangeCategory(category: string) {
    if (category === "member") {
      this.signUpLink = "/auth/signup-member";
    } else if (category === "society") {
      this.signUpLink = "/auth/signup-society";
    }

    this.form.patchValue({ category: category });
  }

  onResetPassword() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    console.log({
      emitted: "enterEmailDialogComponent.onLogin",
      data: this.form.value,
    });

    if (this.form.value.category === "member") {
      this.authService.requestMemberPasswordReset(this.form.value.email);
    } else if (this.form.value.category === "society") {
      this.authService.requestSocietyPasswordReset(this.form.value.email);
    }
  }
}
