import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "add-monthly-fee-dialog.component.html",
})
export class AddMonthlyFeeDialogComponent implements OnInit {
  public monthFee: number = 20;
  public description: string = "";
  constructor(@Inject(MAT_DIALOG_DATA) public data: {}) {}
  ngOnInit(): void {
    this.monthFee = this.data["monthlyFee"];
    this.description = this.data["description"];
  }
}
