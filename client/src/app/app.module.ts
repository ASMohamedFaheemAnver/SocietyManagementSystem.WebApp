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
import { MemberMembersComponent } from './member/member-members/member-members.component';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule,
    AuthModule,
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
  entryComponents: [ErrorComponent],
})
export class AppModule {}
