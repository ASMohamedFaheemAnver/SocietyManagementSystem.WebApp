import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { SocietyService } from "../society.service";
import { environment } from "src/environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { AddPaymentDialogComponent } from "../add-payment-dialog/add-payment-dialog.component";

@Component({
  selector: "app-society-home",
  templateUrl: "./society-home.component.html",
  styleUrls: ["./society-home.component.css"],
})
export class SocietyHomeComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private authService: AuthService,
    private addPaymentDialog: MatDialog
  ) {}
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
  }

  onAddMonthlyFeeToEveryone() {
    this.societyService.addMonthlyFeeToEveryone();
  }

  addMonthlyFee() {
    const editDialogRef = this.addPaymentDialog.open(
      AddPaymentDialogComponent,
      {
        data: { emittedBoolean: true },
        disableClose: true,
      }
    );
  }

  addExtraFee() {
    const editDialogRef = this.addPaymentDialog.open(
      AddPaymentDialogComponent,
      {
        data: { emittedBoolean: false },
        disableClose: true,
      }
    );
  }
}
