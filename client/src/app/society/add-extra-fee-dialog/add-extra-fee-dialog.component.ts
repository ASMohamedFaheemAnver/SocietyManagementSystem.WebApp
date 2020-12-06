import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "add-extra-fee-dialog.component.html",
  styleUrls: ["add-extra-fee-dialog.component.css"],
})
export class AddExtraFeeDialogComponent {
  public extraFee: number = this.data ? this.data["extraFee"] : 20;
  public description: string = this.data
    ? this.data["description"]
    : "Extra fees.";
  constructor(@Inject(MAT_DIALOG_DATA) public data: {}) {}
}
