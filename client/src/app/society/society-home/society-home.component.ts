import { Component, OnInit, OnDestroy } from "@angular/core";
import { SocietyService } from "../society.service";
import { MatDialog } from "@angular/material/dialog";
import { AddMonthlyFeeDialogComponent } from "../add-monthly-fee-dialog/add-monthly-fee-dialog.component";
import { AddExtraFeeDialogComponent } from "../add-extra-fee-dialog/add-extra-fee-dialog.component";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { Log } from "src/app/log.model";
import { Society } from "src/app/society.model";
import { EditFeeLogDialogComponent } from "../edit-fee-log-dialog/edit-fee-log-dialog.component";
import { ConfirmDialogComponent } from "src/app/common/confirm-dialog/confirm-dialog.component";
import { MemberDonationDialogComponent } from "../member-donation-dialog/member-donation-dialog.component";
import { FineMemberDialogComponent } from "../fine-member-dialog/fine-member-dialog.component";
import { AddRefinementFeeDialogComponent } from "../add-refinement-fee-dialog/add-refinement-fee-dialog.component";
import { Router } from "@angular/router";
import { SocietyDonationDialogComponent } from "../society-donation-dialog/society-donation-dialog.component";
import { SocietyExpenseDialogComponent } from "../society-expenses-dialog/society-expense-dialog.component";

@Component({
  selector: "app-society-home",
  templateUrl: "./society-home.component.html",
  styleUrls: ["./society-home.component.css"],
})
export class SocietyHomeComponent implements OnInit, OnDestroy {
  private societyStatusSub: Subscription;
  private societyLogsSub: Subscription;
  private societySub: Subscription;

  constructor(
    private societyService: SocietyService,
    private matDialog: MatDialog,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.societyStatusSub.unsubscribe();
    this.societyLogsSub.unsubscribe();
    this.societySub.unsubscribe();
  }

  society: Society;

  societyId: string;
  email: string;
  name: string;
  imageUrl: string;
  address: string;
  regNo: string;
  expected_income: number;
  current_income: number;
  number_of_members: number;

  isLoading: Boolean;
  currentPage = 0;

  logs: Log[];
  logs_count: number;
  page_size = 10;
  page_size_options = [5, 10, 15, 20];

  ngOnInit(): void {
    this.isLoading = true;
    this.societyService.getSocietyLogs(this.currentPage, this.page_size);
    this.societyService.getSociety();

    this.societySub = this.societyService
      .getSocietyUpdatedListenner()
      .subscribe((society) => {
        console.log({
          emitted: "societyHomeComponent.ngOnInit.getSocietyUpdatedListenner",
          society: society,
        });
        this.society = society;
      });

    this.societyStatusSub = this.societyService
      .getSocietyStatusListenner()
      .subscribe((emitedBoolean) => {
        this.isLoading = false;
      });

    this.societyLogsSub = this.societyService
      .getSocietyLogListenner()
      .subscribe((logsInfo) => {
        this.logs = logsInfo.logs;
        this.logs_count = logsInfo.logs_count;
        console.log({
          emitted: "societyHomeComponent.ngOnInit.getSocietyLogListenner",
          logsInfo: logsInfo,
        });

        if (this.logs_count > 0 && this.logs.length == 0) {
          this.societyService.getSocietyLogs(this.currentPage, this.page_size);
        }
      });
  }

  onAddMonthlyFee() {
    const addMonthlyFeeDialogRef = this.matDialog.open(
      AddMonthlyFeeDialogComponent,
      {
        data: {
          monthlyFee: this.society.month_fee.amount,
          description: this.society.month_fee.description,
        },
        disableClose: true,
      }
    );

    addMonthlyFeeDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.isLoading = true;
      this.societyService.addMonthlyFeeToEveryone(
        data.monthFee,
        data.description
      );
    });
  }

  onAddExtraFee() {
    const addExtraFeeDialogRef = this.matDialog.open(
      AddExtraFeeDialogComponent,
      {
        disableClose: true,
      }
    );
    addExtraFeeDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.isLoading = true;
      this.societyService.addExtraFeeToEveryone(
        data.extraFee,
        data.description
      );
    });
  }

  onAddDonation() {
    const addDonationDialogRef = this.matDialog.open(
      SocietyDonationDialogComponent,
      {
        disableClose: true,
      }
    );
    addDonationDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.isLoading = true;
      this.societyService.addReceivedDonationBySociety(
        data.donation,
        data.description
      );
    });
  }

  onRefinementClick() {
    const addRefinementFeeDialogRef = this.matDialog.open(
      AddRefinementFeeDialogComponent,
      {
        disableClose: true,
      }
    );
    addRefinementFeeDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.isLoading = true;
      this.societyService.addRefinementFeeForSociety(
        data.refinementFee,
        data.description
      );
    });
  }

  onAddExpense() {
    const addExpenseDialogRef = this.matDialog.open(
      SocietyExpenseDialogComponent,
      {
        disableClose: true,
      }
    );
    addExpenseDialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      this.isLoading = true;
      this.societyService.addSocietyExpense(data.expense, data.description);
    });
  }

  changeDefaultUrl() {
    this.society.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded() {
    this.society.isImageLoading = false;
  }

  onPageChange(event: PageEvent) {
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
    this.societyService.getSocietyLogs(event.pageIndex, this.page_size);
  }

  onFeeLogMemberEdit(log_id: string) {
    const editSocietyFeeLogDialogRef = this.matDialog.open(
      EditFeeLogDialogComponent,
      {
        data: {
          log_id: log_id,
        },
        disableClose: true,
      }
    );
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
    } else if (log.kind === "Expense") {
      const editExpenseDialogRef = this.matDialog.open(
        SocietyExpenseDialogComponent,
        {
          data: {
            expense: log.fee.amount,
            description: log.fee.description,
          },
          disableClose: true,
        }
      );
      editExpenseDialogRef.afterClosed().subscribe((data) => {
        if (!data) {
          return;
        }
        if (
          data.expense === log.fee.amount &&
          data.description === log.fee.description
        ) {
          return;
        }
        this.isLoading = true;
        this.societyService.editFeeForEveryone(
          log._id,
          data.expense,
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

  onEditSocietyProfile() {
    this.router.navigateByUrl(`/society/edit-profile`);
  }
}
