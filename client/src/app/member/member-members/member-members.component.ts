import { Component, OnInit, OnDestroy } from "@angular/core";
import { MemberService } from "../member.service";
import { Subscription } from "rxjs";
import { Member } from "src/app/member.model";

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

  constructor(private memberService: MemberService) {}

  ngOnDestroy(): void {
    this.memberStatusSub.unsubscribe();
    this.membersSub.unsubscribe();
    this.memberService.unSubscribelistenSocietyMembers();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.memberService.getAllSocietyMembers();
    this.memberStatusSub = this.memberService
      .getMemberStatusListenner()
      .subscribe((emmitedBoolean) => {
        this.isLoading = emmitedBoolean;
      });
    this.membersSub = this.memberService
      .getMembersUpdateListener()
      .subscribe((members) => {
        console.log({
          emitted: "memberService.ngOnInit.getMembersUpdateListener.subscribe",
          members: members,
        });
        this.members = members;
      });

    this.memberService.listenSocietyMembers();
  }

  changeDefaultUrl(member: Member) {
    member.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded(member: Member) {
    member.isImageLoading = false;
  }
}
