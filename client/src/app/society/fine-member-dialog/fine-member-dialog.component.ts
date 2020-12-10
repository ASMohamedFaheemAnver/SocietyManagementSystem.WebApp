import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Member } from "src/app/member.model";

@Component({
  templateUrl: "fine-member-dialog.component.html",
  styleUrls: ["./fine-member-dialog.component.css"],
})
export class FineMemberDialogComponent {
  public fine: number = 20;
  public description: string = "Fine.";

  constructor(@Inject(MAT_DIALOG_DATA) public data: Member) {}
}
