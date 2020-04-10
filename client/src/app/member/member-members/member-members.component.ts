import { Component, OnInit, OnDestroy } from "@angular/core";
import { MemberService } from "../member.service";
import { Subscription } from "rxjs";
import { Member } from "src/app/member.model";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-member-members",
  templateUrl: "./member-members.component.html",
  styleUrls: ["./member-members.component.css"],
})
export class MemberMembersComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  private membersSub: Subscription;
  private memberStatusSub: Subscription;
  members: Member[];
  backeEndBaseUrl = environment.backeEndBaseUrl2;

  constructor(private memberService: MemberService) {}

  ngOnDestroy(): void {
    this.memberStatusSub.unsubscribe();
    this.membersSub.unsubscribe();
  }

  ngOnInit(): void {
    this.memberService.getAllSocietyMembers();
    this.memberStatusSub = this.memberService
      .getMemberStatusListenner()
      .subscribe((emmitedBoolean) => {
        this.isLoading = emmitedBoolean;
      });
    this.membersSub = this.memberService
      .getMemberUpdateListener()
      .subscribe((members) => {
        this.members = members;
        console.log(this.members);
      });
  }
}
