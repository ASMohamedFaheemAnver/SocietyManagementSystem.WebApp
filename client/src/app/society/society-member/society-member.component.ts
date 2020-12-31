import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Log } from "src/app/log.model";
import { Member } from "src/app/member.model";
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
      } else {
        this.router.navigateByUrl(`/society/members`);
      }
    });
  }

  ngOnDestroy(): void {
    this.memberSub.unsubscribe();
    this.memberLogsSub.unsubscribe();
    this.societyStatusListennerSub.unsubscribe();
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
    const fineDialogRef = this.matDialog.open(MemberDonationDialogComponent, {
      disableClose: true,
    });

    fineDialogRef.afterClosed().subscribe((data) => {
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
}
