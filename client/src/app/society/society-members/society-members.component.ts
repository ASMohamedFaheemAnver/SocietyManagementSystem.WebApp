import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { SocietyService } from "../society.service";
import { Member } from "../../member.model";
import { Subscription } from "rxjs";
import { environment } from "src/environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { FineMemberDialogComponent } from "../fine-member-dialog/fine-member-dialog.component";

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

  constructor(
    private authService: AuthService,
    private societyServie: SocietyService,
    private editMemberDialog: MatDialog
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
    this.societyServie.getAllMembers();
  }

  onApproveMember(member: Member) {
    member.isActionLoading = true;
    this.societyServie.approveMember(member._id);
  }

  onDeleteMember(member: Member) {
    member.isActionLoading = true;
    this.societyServie.deleteMember(member._id);
  }

  onDisApproveMember(member: Member) {
    member.isActionLoading = true;
    this.societyServie.disApproveMember(member._id);
  }

  onEditClick(member: Member) {
    console.log(member);
    const fineDialogRef = this.editMemberDialog.open(
      FineMemberDialogComponent,
      {
        data: member,
        disableClose: true,
      }
    );
  }

  changeDefaultUrl(member: Member) {
    member.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded(member: Member) {
    member.isImageLoading = false;
  }
}
