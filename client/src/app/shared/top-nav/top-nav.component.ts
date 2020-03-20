import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-top-nav",
  templateUrl: "./top-nav.component.html",
  styleUrls: ["./top-nav.component.css"]
})
export class TopNavComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
  private authStatusSub: Subscription;

  constructor(private authService: AuthService) {}
  isAuth = false;
  userId: string;
  homeUrl = "/user/home/";

  ngOnInit(): void {
    this.isAuth = this.authService.isUserAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(emittedBoolean => {
        this.isAuth = emittedBoolean;
      });
    this.userId = this.authService.getUserId();
    this.homeUrl += this.userId;
  }

  onLogOut() {
    this.authService.logOutUser();
  }
}
