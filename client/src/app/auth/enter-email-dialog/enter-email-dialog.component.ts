import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialogRef<EnterEmailDialogComponent>
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
    console.log({
      emitted: "enterEmailDialogComponent.onLogin",
      data: this.form.value,
    });

    this.form.patchValue({ email: "sorry still in testing!" });

    // this.matDialog.close({ data: this.form.value });
  }
}
