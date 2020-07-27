import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { SocietyService } from "../society.service";
import { environment } from "src/environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { AddMonthlyFeeDialogComponent } from "../add-monthly-fee-dialog/add-monthly-fee-dialog.component";
import { AddExtraFeeDialogComponent } from "../add-extra-fee-dialog/add-extra-fee-dialog.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-society-home",
  templateUrl: "./society-home.component.html",
  styleUrls: ["./society-home.component.css"],
})
export class SocietyHomeComponent implements OnInit, OnDestroy {
  private societyStatusSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private authService: AuthService,
    private addMonthlyFeetDialog: MatDialog,
    private addExtraFeeDialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    this.societyStatusSub.unsubscribe();
  }

  societyId: string;
  email: string;
  name: string;
  imageUrl: string;
  address: string;
  regNo: string;

  isLoading: Boolean;

  backeEndBaseUrl = environment.backeEndBaseUrl2;

  ngOnInit(): void {
    this.isLoading = true;
    this.societyService.getSociety().subscribe(
      (society) => {
        console.log(society);
        this.email = society["data"].getSociety.email;
        this.name = society["data"].getSociety.name;
        this.imageUrl = society["data"].getSociety.imageUrl;
        this.address = society["data"].getSociety.address;
        this.regNo = society["data"].getSociety.regNo;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
      }
    );

    this.societyStatusSub = this.societyService
      .getSocietyStatusListenner()
      .subscribe((emitedBoolean) => {
        this.isLoading = emitedBoolean;
      });
  }

  addMonthlyFee() {
    this.isLoading = true;
    this.societyService.getSocietyMonthlyFee().subscribe((res) => {
      this.isLoading = false;
      const addMonthlyFeeDialogRef = this.addMonthlyFeetDialog.open(
        AddMonthlyFeeDialogComponent,
        {
          data: {
            monthlyFee: res["data"].getSociety.month_fee.amount,
            description: res["data"].getSociety.month_fee.description,
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
      console.log(data);
    });
  }
}
