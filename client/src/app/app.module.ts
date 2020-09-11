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
import { AuthInterceptor } from "./auth/auth-interceptor";
import { ErrorInterceptor } from "./error-interceptor";
import { ErrorComponent } from "./error/error.component";
import { MemberHomeComponent } from "./member/member-home/member-home.component";
import { SocietyHomeComponent } from "./society/society-home/society-home.component";
import { SocietyMembersComponent } from "./society/society-members/society-members.component";
import { ImgDeleteInterceptor } from "./auth/img-interceptor";
import { MemberMembersComponent } from "./member/member-members/member-members.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { AddMonthlyFeeDialogComponent } from "./society/add-monthly-fee-dialog/add-monthly-fee-dialog.component";
import { AddExtraFeeDialogComponent } from "./society/add-extra-fee-dialog/add-extra-fee-dialog.component";
import { FineMemberDialogComponent } from "./society/fine-member-dialog/fine-member-dialog.component";
import { ConfirmDialogComponent } from "./common/confirm-dialog/confirm-dialog.component";
import { EditMonthlyFeeLogDialogComponent } from "./society/edit-monthly-fee-log-dialog/edit-monthly-fee-log-dialog.component";

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
    EditMonthlyFeeLogDialogComponent,
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
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ImgDeleteInterceptor,
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
    EditMonthlyFeeLogDialogComponent,
  ],
})
export class AppModule {}
