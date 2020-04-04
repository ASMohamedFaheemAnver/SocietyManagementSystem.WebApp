import { Component, OnInit, OnDestroy } from "@angular/core";
import { DevService } from "../dev.service";
import { Subscription } from "rxjs";
import { Society } from "../society.model";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-dev-home",
  templateUrl: "./dev-home.component.html",
  styleUrls: ["./dev-home.component.css"],
})
export class DevHomeComponent implements OnInit, OnDestroy {
  isLoading = false;
  back_end_url = environment.back_end_url;

  constructor(private devService: DevService) {}
  ngOnDestroy(): void {
    this.societiesSub.unsubscribe();
  }
  societies: Society[] = [];
  private societiesSub: Subscription;
  private devStatusListenner: Subscription;

  ngOnInit(): void {
    this.devService.getAllSociety();
    this.devStatusListenner = this.devService
      .getDevStatusListenner()
      .subscribe((emittedBoolean) => {
        this.isLoading = emittedBoolean;
      });
    this.societiesSub = this.devService
      .getSocietiesUpdateListener()
      .subscribe((societies: Society[]) => {
        this.societies = societies;
      });
  }

  onApproveSociety(societyId: string) {
    this.isLoading = true;
    this.devService.approveSociety(societyId);
  }

  onDisApproveSociety(societyId: string) {
    this.isLoading = true;
    this.devService.disApproveSociety(societyId);
  }

  onDeleteSociety(societyId: string) {
    this.isLoading = true;
    this.devService.deleteSociety(societyId);
  }
}
