import { NgModule } from "@angular/core";
import { LoginComponent } from "./login/login.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AngularMaterialModule } from "../angular-material.module";
import { SignupComponent } from "./signup/signup.component";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [LoginComponent, SignupComponent],
  imports: [ReactiveFormsModule, AngularMaterialModule, CommonModule]
})
export class AuthModule {}
