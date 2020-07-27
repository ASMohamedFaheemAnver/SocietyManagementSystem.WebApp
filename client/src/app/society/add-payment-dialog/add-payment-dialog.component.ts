import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Member } from "src/app/member.model";

@Component({
  templateUrl: "add-payment-dialog.component.html",
})
export class AddPaymentDialogComponent {
  private monthFee: number;
  private extraFee: number;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { emittedBoolean: boolean }
  ) {}

  onDate(event) {
    console.log(event.value);
  }
}
