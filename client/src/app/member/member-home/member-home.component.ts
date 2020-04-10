import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MemberService } from "../member.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-member-home",
  templateUrl: "./member-home.component.html",
  styleUrls: ["./member-home.component.css"],
})
export class MemberHomeComponent implements OnInit {
  constructor(
    private memberService: MemberService,
    private authService: AuthService
  ) {}

  email: string;
  name: string;
  memberId: string;
  imageUrl = "";
  address: string;
  arrears: number;
  backeEndBaseUrl = environment.backeEndBaseUrl2;
  isLoading: boolean;
  ngOnInit(): void {
    this.isLoading = true;
    // this.memberId = this.authService.getUserId();
    this.memberService.getMember().subscribe((member) => {
      console.log(member);
      this.email = member["data"].getMember.email;
      this.name = member["data"].getMember.name;
      this.memberId = member["data"].getMember._id;
      this.imageUrl = member["data"].getMember.imageUrl;
      this.address = member["data"].getMember.address;
      this.arrears = member["data"].getMember.arrears;
      this.isLoading = false;
    });
  }
}
