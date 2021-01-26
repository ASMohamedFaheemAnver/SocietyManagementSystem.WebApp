import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "add-received-case-dialog.component.html",
  styleUrls: ["add-received-case-dialog.component.css"],
})
export class AddReceivedCaseDialogComponent {
  public received_amount: number = this.data
    ? this.data["received_amount"]
    : 20;
  public description: string = this.data
    ? this.data["description"]
    : "Case received.";
  constructor(@Inject(MAT_DIALOG_DATA) public data: {}) {}
}
