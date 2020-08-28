import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { SocietyService } from "../society.service";
import { environment } from "src/environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { AddMonthlyFeeDialogComponent } from "../add-monthly-fee-dialog/add-monthly-fee-dialog.component";
import { AddExtraFeeDialogComponent } from "../add-extra-fee-dialog/add-extra-fee-dialog.component";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { Log } from "src/app/log.model";
import { Society } from "src/app/society.model";

@Component({
  selector: "app-society-home",
  templateUrl: "./society-home.component.html",
  styleUrls: ["./society-home.component.css"],
})
export class SocietyHomeComponent implements OnInit, OnDestroy {
  private societyStatusSub: Subscription;
  private societyLogSub: Subscription;
  private societySub: Subscription;

  private logSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private authService: AuthService,
    private addMonthlyFeetDialog: MatDialog,
    private addExtraFeeDialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.societyStatusSub.unsubscribe();
    this.societyLogSub.unsubscribe();
    this.societySub.unsubscribe();
    this.logSub.unsubscribe();
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
  page_size = 5;
  page_size_options = [5, 10, 15, 20];

  backeEndBaseUrl = environment.backeEndBaseUrl2;
  isImageLoading = false;
  ngOnInit(): void {
    this.isLoading = true;
    this.isImageLoading = true;
    this.societyService.getSocietyLogs(this.currentPage, this.page_size);
    this.societyService.getSociety();

    this.societySub = this.societyService
      .getSocietyUpdatedListenner()
      .subscribe((society) => {
        console.log({ msg: "Emitted society.", data: society });
        this.society = society;
      });

    this.societyStatusSub = this.societyService
      .getSocietyStatusListenner()
      .subscribe((emitedBoolean) => {
        this.isLoading = emitedBoolean;
      });

    this.societyLogSub = this.societyService
      .getSocietyLogListenner()
      .subscribe((logsInfo) => {
        this.logs = logsInfo.logs;
        this.logs_count = logsInfo.logs_count;
        console.log(logsInfo);
      });

    this.logSub = this.societyService
      .getlogUpdatedLintenner()
      .subscribe((newLog: Log) => {
        this.logs.unshift(newLog);
        this.logs_count++;
      });
  }

  addMonthlyFee() {
    this.isLoading = false;
    const addMonthlyFeeDialogRef = this.addMonthlyFeetDialog.open(
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

  addExtraFee() {
    const addExtraFeeDialogRef = this.addExtraFeeDialog.open(
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

  changeDefaultUrl() {
    this.society.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded() {
    this.society.isLoading = false;
  }

  onPageChange(event: PageEvent) {
    if (
      this.page_size === event.pageSize &&
      this.currentPage === event.pageIndex
    ) {
      return;
    }
    this.currentPage = event.pageIndex;
    this.page_size = event.pageSize;
    this.societyService.getSocietyLogs(event.pageIndex, this.page_size);
  }
}
