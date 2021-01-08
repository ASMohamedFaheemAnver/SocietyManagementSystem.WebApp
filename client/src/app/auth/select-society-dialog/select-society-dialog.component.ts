import { Component, OnInit } from "@angular/core";
import { Log } from "src/app/log.model";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: "select-society-dialog.component.html",
  styleUrls: ["select-society-dialog.component.css"],
})
export class SelectSocietyDialogComponent implements OnInit {
  offlineLog: Log;

  societies = [];
  isLoading = false;

  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.isLoading = true;
    this.authService.getBasicSocietyDetailes().subscribe(
      (res) => {
        this.isLoading = false;
        this.societies = res["data"]["getBasicSocietyDetailes"];
        console.log({
          emitted:
            "SelectSocietyDialogComponent.ngOnInit.getBasicSocietyDetailes.subscribe",
          societies: this.societies,
        });
      },
      (err) => {
        this.isLoading = false;
        console.log(err);
      }
    );
  }
}
