import { Component, OnInit, OnDestroy } from "@angular/core";
import { DevService } from "../dev.service";
import { Subscription } from "rxjs";
import { Society } from "../../society.model";

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

  onApproveSociety(society: Society) {
    society.isActionLoading = true;

    this.devService.approveSociety(society._id);
  }

  onDisApproveSociety(society: Society) {
    society.isActionLoading = true;

    this.devService.disApproveSociety(society._id);
  }

  onDeleteSociety(society: Society) {
    society.isActionLoading = true;

    this.devService.deleteSociety(society._id);
  }

  changeDefaultUrl(society: Society) {
    society.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded(society: Society) {
    society.isImageLoading = false;
  }
}
