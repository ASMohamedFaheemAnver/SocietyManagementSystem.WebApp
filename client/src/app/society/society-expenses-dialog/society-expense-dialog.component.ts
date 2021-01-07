import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  templateUrl: "society-expense-dialog.component.html",
  styleUrls: ["./society-expense-dialog.component.css"],
})
export class SocietyExpenseDialogComponent {
  public expense: number = 20;
  public description: string = "Expenses.";

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { expense: number; description: string }
  ) {
    if (this.data) {
      this.expense = this.data.expense;
      this.description = this.data.description;
    }
  }
}
