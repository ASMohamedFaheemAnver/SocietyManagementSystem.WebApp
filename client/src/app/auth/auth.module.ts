import { NgModule } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "../angular-material.module";
import { SignupMemberComponent } from "./signup-member/signup-member.component";
import { CommonModule } from "@angular/common";
import { SignupSocietyComponent } from './signup-society/signup-society.component';

@NgModule({
  declarations: [LoginComponent, SignupMemberComponent, SignupSocietyComponent],
  imports: [ReactiveFormsModule, AngularMaterialModule, CommonModule]
})
export class AuthModule {}
