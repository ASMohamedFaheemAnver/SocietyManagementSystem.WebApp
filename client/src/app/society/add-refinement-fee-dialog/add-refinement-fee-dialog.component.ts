import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "add-refinement-fee-dialog.component.html",
  styleUrls: ["add-refinement-fee-dialog.component.css"],
})
export class AddRefinementFeeDialogComponent {
  public refinementFee: number = this.data ? this.data["refinementFee"] : 20;
  public description: string = this.data
    ? this.data["description"]
    : "Refinement fees.";
  constructor(@Inject(MAT_DIALOG_DATA) public data: {}) {}
}
