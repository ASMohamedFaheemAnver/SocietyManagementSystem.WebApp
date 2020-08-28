import { Component, OnInit, OnDestroy } from "@angular/core";
import { DevService } from "../dev.service";
import { Subscription } from "rxjs";
import { Society } from "../society.model";

@Component({
  selector: "app-dev-home",
  templateUrl: "./dev-home.component.html",
  styleUrls: ["./dev-home.component.css"],
})
export class DevHomeComponent implements OnInit, OnDestroy {
  isLoading = false;

  constructor(private devService: DevService) {}
  ngOnDestroy(): void {
    this.societiesSub.unsubscribe();
    this.devStatusSub.unsubscribe();
  }
  societies: Society[] = [];
  private societiesSub: Subscription;
  private devStatusSub: Subscription;

  loadingCSS = {
    top: "100px",
  };

  ngOnInit(): void {
    this.isLoading = true;
    this.devService.getAllSociety();
    this.devStatusSub = this.devService
      .getDevStatusListenner()
      .subscribe((emittedBoolean) => {
        this.isLoading = emittedBoolean;
      });
    this.societiesSub = this.devService
      .getSocietiesUpdateListener()
      .subscribe((societies: Society[]) => {
        this.societies = societies;
        this.isLoading = false;
      });
  }

  onApproveSociety($event, societyId: string) {
    this.isLoading = true;
    this.loadingCSS = {
      top: $event.y + "px",
      // top: $event.y + "px",
      // left: $event.x + "px",
    };

    this.devService.approveSociety(societyId);
  }

  onDisApproveSociety($event, societyId: string) {
    this.isLoading = true;
    this.loadingCSS = {
      top: $event.y + "px",
      // top: $event.y + "px",
      // left: $event.x + "px",
    };
    this.devService.disApproveSociety(societyId);
  }

  onDeleteSociety($event, societyId: string) {
    this.isLoading = true;
    this.loadingCSS = {
      top: $event.y + "px",
      // top: $event.y + "px",
      // left: $event.x + "px",
    };
    this.devService.deleteSociety(societyId);
  }

  changeDefaultUrl(society: Society) {
    society.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded(society: Society) {
    society.isLoading = false;
  }
}
