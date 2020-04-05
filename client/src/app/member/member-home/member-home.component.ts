import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MemberService } from "../member.service";

@Component({
  selector: "app-member-home",
  templateUrl: "./member-home.component.html",
  styleUrls: ["./member-home.component.css"],
})
export class MemberHomeComponent implements OnInit {
  constructor(
    private memberService: MemberService,
    private route: ActivatedRoute
  ) {}

  email: string;
  name: string;
  memberId: string;
  imageUrl = "";
  address: string;
  arrears: number;

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("memberId")) {
        this.memberId = paramMap.get("memberId");
        this.memberService.getOneUser(this.memberId).subscribe((user) => {
          console.log(user);
          this.email = user["data"].getOneUser.email;
          this.name = user["data"].getOneUser.name;
          this.memberId = user["data"].getOneUser._id;
          this.imageUrl = user["data"].getOneUser.imageUrl;
          this.address = user["data"].getOneUser.address;
          this.arrears = user["data"].getOneUser.arrears;
        });
      }
    });
  }
}
