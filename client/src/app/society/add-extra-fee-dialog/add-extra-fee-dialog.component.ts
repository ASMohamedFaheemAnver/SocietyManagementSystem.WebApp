import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "add-extra-fee-dialog.component.html",
})
export class AddExtraFeeDialogComponent {
  public extraFee: number = 0;
  public description: string = "";
  constructor(@Inject(MAT_DIALOG_DATA) public data: {}) {}
}
