import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./auth/login/login.component";
import { SignupMemberComponent } from "./auth/signup-member/signup-member.component";
import { AuthGuard } from "./auth/auth.guard";
import { DevHomeComponent } from "./developer/dev-home/dev-home.component";
import { SignupSocietyComponent } from "./auth/signup-society/signup-society.component";
import { MemberHomeComponent } from "./member/member-home/member-home.component";
import { SocietyHomeComponent } from "./society/society-home/society-home.component";
import { SocietyMembersComponent } from "./society/society-members/society-members.component";
import { MemberMembersComponent } from "./member/member-members/member-members.component";
import { SocietyMemberComponent } from "./society/society-member/society-member.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { EditSocietyProfileComponent } from "./society/edit-society-profile/edit-society-profile.component";
import { EditMemberProfileComponent } from "./member/edit-member-profile/edit-member-profile.component";

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
    path: "member/home",
    component: MemberHomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "developer/home",
    component: DevHomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "society/home",
    component: SocietyHomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "society/members",
    component: SocietyMembersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "society/edit-profile",
    component: EditSocietyProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "society/member/:memberId",
    component: SocietyMemberComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "member/members",
    component: MemberMembersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "member/edit-profile",
    component: EditMemberProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "**",
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
