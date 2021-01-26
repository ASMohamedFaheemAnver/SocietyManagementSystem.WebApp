import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "add-other-income-dialog.component.html",
  styleUrls: ["add-other-income-dialog.component.css"],
})
export class AddOtherIncomeDialogComponent {
  public other_income: number = this.data ? this.data["other_income"] : 20;
  public description: string = this.data
    ? this.data["description"]
    : "Other income.";
  constructor(@Inject(MAT_DIALOG_DATA) public data: {}) {}
}
