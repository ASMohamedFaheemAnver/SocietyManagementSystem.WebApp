import { Component, OnInit, OnDestroy } from "@angular/core";
import { DevService } from "../dev.service";
import { Subscription } from "rxjs";
import { Society } from "../../society.model";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "src/app/common/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-dev-home",
  templateUrl: "./dev-home.component.html",
  styleUrls: ["./dev-home.component.css"],
})
export class DevHomeComponent implements OnInit, OnDestroy {
  isLoading = false;
  societies: Society[] = [];
  private societiesSub: Subscription;
  private devStatusSub: Subscription;

  loadingCSS = {
    top: "100px",
  };

  constructor(
    private devService: DevService,
    private confirmDialog: MatDialog
  ) {}

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

    this.devService.listenSociety();
  }

  ngOnDestroy(): void {
    this.societiesSub.unsubscribe();
    this.devStatusSub.unsubscribe();
    this.devService.unSubscribeListenSocieties();
  }

  onApproveSociety(society: Society) {
    const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: {
        msg:
          "Approved society can use all feature provided by our system, Do you want to continue?",
      },
      disableClose: true,
    });

    confirmDialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        society.isActionLoading = true;

        this.devService.approveSociety(society._id);
      }
    });
  }

  onDisApproveSociety(society: Society) {
    const confirmDialogRef = this.confirmDialog.open(ConfirmDialogComponent, {
      data: {
        msg:
          "Disapproved society can't be able to login or use system features, Do you want to continue?",
      },
      disableClose: true,
    });

    confirmDialogRef.afterClosed().subscribe((isConfirmed) => {
      if (isConfirmed) {
        society.isActionLoading = true;

        this.devService.disApproveSociety(society._id);
      }
    });
  }

  changeDefaultUrl(society: Society) {
    society.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded(society: Society) {
    society.isImageLoading = false;
  }
}
