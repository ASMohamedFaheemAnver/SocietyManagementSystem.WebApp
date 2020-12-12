import { Component, OnInit, OnDestroy } from "@angular/core";
import { SocietyService } from "../society.service";
import { Member } from "../../member.model";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { FineMemberDialogComponent } from "../fine-member-dialog/fine-member-dialog.component";
import { ConfirmDialogComponent } from "src/app/common/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-society-members",
  templateUrl: "./society-members.component.html",
  styleUrls: ["./society-members.component.css"],
})
export class SocietyMembersComponent implements OnInit, OnDestroy {
  members: Member[] = [];
  isLoading: boolean;
  private membersSub: Subscription;
  private societyStatusSub: Subscription;

  constructor(
    private societyServie: SocietyService,
    private editMemberDialog: MatDialog,
    private confirmDialog: MatDialog
  ) {}
  ngOnDestroy(): void {
    this.membersSub.unsubscribe();
    this.societyStatusSub.unsubscribe();
    this.societyServie.unSubscribeListenNewSocietyMembers();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.membersSub = this.societyServie
      .getMembersUpdateListenner()
      .subscribe((members) => {
        this.members = members;
        console.log({
          emitted: "societyMemberComponent.ngOnInit",
          members: members,
        });
      });
    this.societyStatusSub = this.societyServie
      .getSocietyStatusListenner()
      .subscribe((emitedBoolean) => {
        this.isLoading = emitedBoolean;
      });
    this.societyServie.getAllMembers();
    this.societyServie.listenNewSocietyMembers();
  }

  onApproveMember(member: Member) {
    const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: {
        msg:
          "Approved member can be able to login and view society informations, Do you want to continue?",
      },
      disableClose: true,
    });

    confirmDialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        member.isActionLoading = true;
        this.societyServie.approveMember(member._id);
      }
    });
  }

  onDisApproveMember(member: Member) {
    const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: {
        msg:
          "Disappoved member can't be able to login or view society information, Do you want to continue?",
      },
      disableClose: true,
    });

    confirmDialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        member.isActionLoading = true;
        this.societyServie.disApproveMember(member._id);
      }
    });
  }

  onFineClick(member: Member) {
    const fineDialogRef = this.editMemberDialog.open(
      FineMemberDialogComponent,
      {
        data: member,
        disableClose: true,
      }
    );

    fineDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }

      member.isActionLoading = true;

      this.societyServie.addFineForOneMember(
        data.fine,
        data.description,
        member._id
      );
    });
  }

  changeDefaultUrl(member: Member) {
    member.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded(member: Member) {
    member.isImageLoading = false;
  }
}
