import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { SignupComponent } from "./auth/signup/signup.component";
import { HomeComponent } from "./user/home/home.component";
import { AuthGuard } from "./auth/auth.guard";
import { MemberComponent } from "./user/member/member.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "auth/login",
    pathMatch: "full"
  },
  {
    path: "auth/login",
    component: LoginComponent
  },
  {
    path: "auth/signup",
    component: SignupComponent
  },
  {
    path: "user/home/:userId",
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "user/members",
    component: MemberComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
