import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { SocietyService } from "../society.service";
import { Member } from "../../member.model";
import { Subscription } from "rxjs";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-society-members",
  templateUrl: "./society-members.component.html",
  styleUrls: ["./society-members.component.css"],
})
export class SocietyMembersComponent implements OnInit, OnDestroy {
  backeEndBaseUrl = environment.backeEndBaseUrl2;

  members: Member[] = [];
  isLoading: boolean;
  private membersSub: Subscription;
  private societyStatusSub: Subscription;

  loadingCSS;

  constructor(
    private authService: AuthService,
    private societyServie: SocietyService
  ) {}
  ngOnDestroy(): void {
    this.membersSub.unsubscribe();
    this.societyStatusSub.unsubscribe();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.membersSub = this.societyServie
      .getMembersUpdateListenner()
      .subscribe((members) => {
        this.members = members;
        console.log(members);
      });
    this.societyStatusSub = this.societyServie
      .getSocietyStatusListenner()
      .subscribe((emitedBoolean) => {
        this.isLoading = emitedBoolean;
      });
    this.societyServie.getAllSocietyMembers();
  }

  onApproveMember($event: MouseEvent, memberId: string) {
    this.loadingCSS = {
      top: $event.y + "px",
      // left: $event.x + "px",
    };

    this.isLoading = true;
    this.societyServie.approveMember(memberId);
  }

  onDeleteMember($event: MouseEvent, memberId: string) {
    this.loadingCSS = {
      top: $event.y + "px",
      // left: $event.x + "px",
    };
    this.isLoading = true;
    this.societyServie.deleteMember(memberId);
  }

  onDisApproveMember($event: MouseEvent, memberId: string) {
    this.loadingCSS = {
      top: $event.y + "px",
      // left: $event.x + "px",
    };
    this.isLoading = true;
    this.societyServie.disApproveMember(memberId);
  }
}
