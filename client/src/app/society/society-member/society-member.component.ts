import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ConfirmDialogComponent } from "src/app/common/confirm-dialog/confirm-dialog.component";
import { Log } from "src/app/log.model";
import { Member } from "src/app/member.model";
import { AddExtraFeeDialogComponent } from "../add-extra-fee-dialog/add-extra-fee-dialog.component";
import { AddMonthlyFeeDialogComponent } from "../add-monthly-fee-dialog/add-monthly-fee-dialog.component";
import { AddRefinementFeeDialogComponent } from "../add-refinement-fee-dialog/add-refinement-fee-dialog.component";
import { FineMemberDialogComponent } from "../fine-member-dialog/fine-member-dialog.component";
import { MemberDonationDialogComponent } from "../member-donation-dialog/member-donation-dialog.component";
import { SocietyService } from "../society.service";

@Component({
  selector: "app-society-member",
  templateUrl: "./society-member.component.html",
  styleUrls: ["./society-member.component.css"],
})
export class SocietyMemberComponent implements OnInit, OnDestroy {
  isLoading: boolean;
  currentPage = 0;

  logs: Log[];
  logs_count: number = 0;
  page_size = 5;
  page_size_options = [5, 10, 15, 20];
  memberId;

  private memberLogsSub: Subscription;
  private societyStatusListennerSub: Subscription;
  private memberSub: Subscription;

  member: Member;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private societyService: SocietyService,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("memberId")) {
        this.memberId = paramMap.get("memberId");

        this.memberSub = this.societyService
          .getMemberUpdateListener()
          .subscribe((member) => {
            console.log({
              emitted:
                "societyMemberComponent.ngOnInit.getMemberUpdateListener",
              member: member,
            });

            this.member = {
              ...member,
              isImageLoading: this.member ? this.member.isImageLoading : true,
            };
          });

        this.societyStatusListennerSub = this.societyService
          .getSocietyStatusListenner()
          .subscribe((isPassed) => {
            this.isLoading = false;
          });

        this.memberLogsSub = this.societyService
          .getMemberLogsUpdateListenner()
          .subscribe((logsInfo) => {
            console.log({
              emitted: "societyMemberComponent.ngOnInit.getMemberLogsListenner",
              logsInfo: logsInfo,
            });
            this.logs = logsInfo.logs;
            this.logs_count = logsInfo.logs_count;
          });

        this.societyService.getMemberById(this.memberId);
        this.societyService.getMemberLogsById(
          this.memberId,
          this.currentPage,
          this.page_size
        );

        this.societyService.listenMemberById(this.memberId);
      } else {
        this.router.navigateByUrl(`/society/members`);
      }
    });
  }

  ngOnDestroy(): void {
    this.memberSub.unsubscribe();
    this.memberLogsSub.unsubscribe();
    this.societyStatusListennerSub.unsubscribe();
    this.societyService.unSubscribeListenMemberById();
  }

  changeDefaultUrl() {
    this.member.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded() {
    this.member.isImageLoading = false;
  }

  onPageChange(event: PageEvent) {
    console.log({ emitted: "onPageChange" });
    this.isLoading = true;
    if (
      this.page_size === event.pageSize &&
      this.currentPage === event.pageIndex
    ) {
      this.isLoading = false;
      return;
    }
    this.currentPage = event.pageIndex;
    this.page_size = event.pageSize;
    this.societyService.getMemberLogsById(
      this.memberId,
      event.pageIndex,
      this.page_size
    );
  }

  onRefinementClick() {
    const refinementDialogRef = this.matDialog.open(
      AddRefinementFeeDialogComponent,
      {
        disableClose: true,
      }
    );

    refinementDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }

      this.isLoading = true;

      this.societyService.addRefinementFeeForOneMember(
        data.refinementFee,
        data.description,
        this.member._id
      );
    });
  }

  onDonationClick() {
    const donationDialogRef = this.matDialog.open(
      MemberDonationDialogComponent,
      {
        disableClose: true,
      }
    );

    donationDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }

      this.isLoading = true;

      this.societyService.addDonationForOneMember(
        data.donation,
        data.description,
        this.member._id
      );
    });
  }

  onFineClick() {
    const fineDialogRef = this.matDialog.open(FineMemberDialogComponent, {
      disableClose: true,
    });

    fineDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }

      this.isLoading = true;

      this.societyService.addFineForOneMember(
        data.fine,
        data.description,
        this.member._id
      );
    });
  }

  onFeeLogEdit(log: Log) {
    if (log.kind === "MonthFee") {
      const editMonthlyFeeDialogRef = this.matDialog.open(
        AddMonthlyFeeDialogComponent,
        {
          data: {
            monthlyFee: log.fee.amount,
            description: log.fee.description,
          },
          disableClose: true,
        }
      );

      editMonthlyFeeDialogRef.afterClosed().subscribe((data) => {
        if (!data) {
          return;
        }
        if (
          data.monthFee === log.fee.amount &&
          data.description === log.fee.description
        ) {
          return;
        }

        this.isLoading = true;
        this.societyService.editFeeForEveryone(
          log._id,
          data.monthFee,
          data.description
        );
      });
    } else if (log.kind === "ExtraFee") {
      const editExtraFeeDialogRef = this.matDialog.open(
        AddExtraFeeDialogComponent,
        {
          data: {
            extraFee: log.fee.amount,
            description: log.fee.description,
          },
          disableClose: true,
        }
      );
      editExtraFeeDialogRef.afterClosed().subscribe((data) => {
        if (!data) {
          return;
        }
        if (
          data.extraFee === log.fee.amount &&
          data.description === log.fee.description
        ) {
          return;
        }
        this.isLoading = true;
        this.societyService.editFeeForEveryone(
          log._id,
          data.extraFee,
          data.description
        );
      });
    } else if (log.kind === "Donation") {
      const editDonationDialogRef = this.matDialog.open(
        MemberDonationDialogComponent,
        {
          data: {
            donation: log.fee.amount,
            description: log.fee.description,
          },
          disableClose: true,
        }
      );
      editDonationDialogRef.afterClosed().subscribe((data) => {
        if (!data) {
          return;
        }
        if (
          data.donation === log.fee.amount &&
          data.description === log.fee.description
        ) {
          return;
        }
        this.isLoading = true;
        this.societyService.editFeeForEveryone(
          log._id,
          data.donation,
          data.description
        );
      });
    } else if (log.kind === "Fine") {
      const editFineDialogRef = this.matDialog.open(FineMemberDialogComponent, {
        data: {
          fine: log.fee.amount,
          description: log.fee.description,
        },
        disableClose: true,
      });
      editFineDialogRef.afterClosed().subscribe((data) => {
        if (!data) {
          return;
        }
        if (
          data.fine === log.fee.amount &&
          data.description === log.fee.description
        ) {
          return;
        }
        this.isLoading = true;
        this.societyService.editFeeForEveryone(
          log._id,
          data.fine,
          data.description
        );
      });
    } else if (log.kind === "RefinementFee") {
      const editRefinementFeeDialogRef = this.matDialog.open(
        AddRefinementFeeDialogComponent,
        {
          data: {
            refinementFee: log.fee.amount,
            description: log.fee.description,
          },
          disableClose: true,
        }
      );
      editRefinementFeeDialogRef.afterClosed().subscribe((data) => {
        if (!data) {
          return;
        }
        if (
          data.refinementFee === log.fee.amount &&
          data.description === log.fee.description
        ) {
          return;
        }
        this.isLoading = true;
        this.societyService.editFeeForEveryone(
          log._id,
          data.refinementFee,
          data.description
        );
      });
    }
  }

  onFeeLogDelete(log: Log) {
    const confirmDialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: {
        msg:
          "Deleting past activity will undo payments related to the activity, do you want to continue?",
      },
      disableClose: true,
    });

    confirmDialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        this.societyService.deleteFeeLog(log);
      }
    });
  }

  onDeleteSocietyMember() {
    const confirmDialogRef = this.matDialog.open(ConfirmDialogComponent, {
      data: {
        msg: "You can't undo this operation, do you want to continue?",
      },
      disableClose: true,
    });

    confirmDialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        this.isLoading = true;
        this.societyService.deleteSocietyMemberById(this.memberId);
      }
    });
  }

  oneMakeFeePaidForOneMember(track_id, log_id) {
    this.societyService.makeFeePaidForOneMember(track_id, log_id);
  }

  oneMakeFeeUnPaidForOneMember(track_id, log_id) {
    this.societyService.makeFeeUnPaidForOneMember(track_id, log_id);
  }
}
