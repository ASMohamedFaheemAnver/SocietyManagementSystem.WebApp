import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AngularMaterialModule } from "./angular-material.module";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthModule } from "./auth/auth.module";
import { TopNavComponent } from "./shared/top-nav/top-nav.component";
import { DevHomeComponent } from "./developer/dev-home/dev-home.component";
import { ErrorInterceptor } from "./error-interceptor";
import { ErrorComponent } from "./error/error.component";
import { MemberHomeComponent } from "./member/member-home/member-home.component";
import { SocietyHomeComponent } from "./society/society-home/society-home.component";
import { SocietyMembersComponent } from "./society/society-members/society-members.component";
import { MemberMembersComponent } from "./member/member-members/member-members.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { AddMonthlyFeeDialogComponent } from "./society/add-monthly-fee-dialog/add-monthly-fee-dialog.component";
import { AddExtraFeeDialogComponent } from "./society/add-extra-fee-dialog/add-extra-fee-dialog.component";
import { FineMemberDialogComponent } from "./society/fine-member-dialog/fine-member-dialog.component";
import { ConfirmDialogComponent } from "./common/confirm-dialog/confirm-dialog.component";
import { EditFeeLogDialogComponent } from "./society/edit-fee-log-dialog/edit-fee-log-dialog.component";
import { GraphQLModule } from "./graphql.module";
import { MemberDonationDialogComponent } from "./society/member-donation-dialog/member-donation-dialog.component";
import { SocietyMemberComponent } from "./society/society-member/society-member.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { AddRefinementFeeDialogComponent } from "./society/add-refinement-fee-dialog/add-refinement-fee-dialog.component";
import { EditSocietyProfileComponent } from "./society/edit-society-profile/edit-society-profile.component";
import { EditMemberProfileComponent } from "./member/edit-member-profile/edit-member-profile.component";
import { SocietyDonationDialogComponent } from "./society/society-donation-dialog/society-donation-dialog.component";
import { SocietyExpenseDialogComponent } from "./society/society-expenses-dialog/society-expense-dialog.component";
import { SelectSocietyDialogComponent } from "./auth/select-society-dialog/select-society-dialog.component";
import { EnterEmailDialogComponent } from "./auth/enter-email-dialog/enter-email-dialog.component";
import { ResetPasswordDialogComponent } from "./auth/reset-password-dialog/reset-password-dialog.component";

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    MemberHomeComponent,
    DevHomeComponent,
    ErrorComponent,
    SocietyHomeComponent,
    SocietyMembersComponent,
    MemberMembersComponent,
    FineMemberDialogComponent,
    AddMonthlyFeeDialogComponent,
    AddExtraFeeDialogComponent,
    ConfirmDialogComponent,
    EditFeeLogDialogComponent,
    MemberDonationDialogComponent,
    SocietyMemberComponent,
    NotFoundComponent,
    AddRefinementFeeDialogComponent,
    EditSocietyProfileComponent,
    EditMemberProfileComponent,
    SocietyDonationDialogComponent,
    SocietyExpenseDialogComponent,
    SelectSocietyDialogComponent,
    EnterEmailDialogComponent,
    ResetPasswordDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule,
    AuthModule,
    ReactiveFormsModule,
    FormsModule,
    MatNativeDateModule,
    GraphQLModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorComponent,
    FineMemberDialogComponent,
    AddMonthlyFeeDialogComponent,
    AddExtraFeeDialogComponent,
    ConfirmDialogComponent,
    EditFeeLogDialogComponent,
    MemberDonationDialogComponent,
    AddRefinementFeeDialogComponent,
    SocietyDonationDialogComponent,
    SocietyExpenseDialogComponent,
    SelectSocietyDialogComponent,
    EnterEmailDialogComponent,
    ResetPasswordDialogComponent,
  ],
})
export class AppModule {}
