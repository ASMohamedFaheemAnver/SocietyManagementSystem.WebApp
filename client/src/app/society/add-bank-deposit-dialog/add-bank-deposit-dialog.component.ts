import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "add-bank-deposit-dialog.component.html",
  styleUrls: ["add-bank-deposit-dialog.component.css"],
})
export class AddBankDepositDialogComponent {
  public deposit_amount: number = this.data ? this.data["deposit_amount"] : 20;
  public description: string = this.data
    ? this.data["description"]
    : "Bank deposite.";
  constructor(@Inject(MAT_DIALOG_DATA) public data: {}) {}
}
