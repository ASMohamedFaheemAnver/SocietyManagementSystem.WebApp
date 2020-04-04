import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { SignupMemberComponent } from "./auth/signup-member/signup-member.component";
import { AuthGuard } from "./auth/auth.guard";
import { MemberComponent } from "./member/members/members.component";
import { DevHomeComponent } from "./developer/dev-home/dev-home.component";
import { SignupSocietyComponent } from "./auth/signup-society/signup-society.component";
import { MemberHomeComponent } from "./member/member-home/member-home.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "auth/login",
    pathMatch: "full",
  },
  {
    path: "auth/login",
    component: LoginComponent,
  },
  {
    path: "auth/signup-member",
    component: SignupMemberComponent,
  },
  {
    path: "auth/signup-society",
    component: SignupSocietyComponent,
  },
  {
    path: "member/home/:memberId",
    component: MemberHomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "member/members",
    component: MemberComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "developer/home",
    component: DevHomeComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
