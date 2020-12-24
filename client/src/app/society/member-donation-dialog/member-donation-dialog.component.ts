import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "member-donation-dialog.component.html",
  styleUrls: ["./member-donation-dialog.component.css"],
})
export class MemberDonationDialogComponent {
  public donation: number = 20;
  public description: string = "Donation.";

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { donation: number; description: string }
  ) {
    if (this.data) {
      this.donation = this.data.donation;
      this.description = this.data.description;
    }
  }
}
