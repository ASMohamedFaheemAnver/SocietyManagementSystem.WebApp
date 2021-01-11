import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { PasswordResetSnackComponent } from "src/app/common/snackbars/password-reset.component";
import { AuthService } from "../auth.service";
import { Location } from "@angular/common";

@Component({
  templateUrl: "reset-password-dialog.component.html",
  styleUrls: ["reset-password-dialog.component.css"],
})
export class ResetPasswordDialogComponent implements OnInit {
  form: FormGroup;

  isLoading = false;
  hide = true;

  signUpLink = "/auth/signup-member";

  private authStatusSub: Subscription;
  private authPasswordResetStatusSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { category: string; token: string },
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialogRef<ResetPasswordDialogComponent>,
    private snackBar: MatSnackBar,
    private location: Location
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
        if (!emittedBoolean) {
          return;
        }

        this.matDialog.close();
        this.location.replaceState(this.location.path().split("?")[0], "");
        this.snackBar.open(
          "Your password has been reset successfully!",
          "Close",
          {
            duration: 5000,
          }
        );
      });

    this.form = new FormGroup({
      password: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(8)],
      }),
      category: new FormControl(null, { validators: [Validators.required] }),
    });

    this.form.patchValue({ category: this.data.category });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.authPasswordResetStatusSub.unsubscribe();
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
      this.authService.memberPasswordReset(
        this.form.value.password,
        this.data.token
      );
    } else if (this.form.value.category === "society") {
      this.authService.societyPasswordReset(
        this.form.value.password,
        this.data.token
      );
    }
  }
}
