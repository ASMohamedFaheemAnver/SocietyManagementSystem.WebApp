import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SocietyService } from "../society.service";
import { Log } from "src/app/log.model";

@Component({
  templateUrl: "edit-monthly-fee-log-dialog.component.html",
  styleUrls: ["edit-monthly-fee-log-dialog.component.css"],
})
export class EditMonthlyFeeLogDialogComponent implements OnInit {
  offlineLog: Log;
  constructor(
    private societyService: SocietyService,
    @Inject(MAT_DIALOG_DATA) public data: { log_id: string }
  ) {}
  ngOnInit(): void {
    this.offlineLog = this.societyService.getOneSocietyOfflineLog(
      this.data.log_id
    );
  }

  oneMakeFeePaidForOneMember(track_id, log_id) {
    this.societyService.makeFeePaidForOneMember(track_id, log_id);
  }

  oneMakeFeeUnPaidForOneMember(track_id, log_id) {
    this.societyService.makeFeeUnPaidForOneMember(track_id, log_id);
  }
}
