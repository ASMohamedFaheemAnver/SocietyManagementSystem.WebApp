import { Component, OnInit, OnDestroy } from "@angular/core";
import { ParamMap, ActivatedRoute } from "@angular/router";
import { MemberService } from "../member.service";
import { AuthService } from "src/app/auth/auth.service";
import { Subscription } from "rxjs";
import { Member } from "../member.model";

@Component({
  selector: "app-member",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.css"],
})
export class MemberComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.usersSub.unsubscribe();
  }
  private usersSub: Subscription;

  constructor(private memberService: MemberService) {}

  email: string;
  name: string;
  userId: string;
  imageUrl = "";
  address: string;
  arrears: number;
  users: Member[] = [];

  ngOnInit(): void {
    this.memberService.getAllUsers();
    this.usersSub = this.memberService
      .getUserUpdateListener()
      .subscribe((users) => {
        this.users = users;
      });
  }
}
