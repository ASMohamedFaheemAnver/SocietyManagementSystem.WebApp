import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "fine-member-dialog.component.html",
  styleUrls: ["./fine-member-dialog.component.css"],
})
export class FineMemberDialogComponent {
  public fine: number = 20;
  public description: string = "Fine.";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { fine: number; description: string }
  ) {
    if (this.data) {
      this.fine = this.data.fine;
      this.description = this.data.description;
    }
  }
}
