import { Component, OnInit, OnDestroy } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-top-nav",
  templateUrl: "./top-nav.component.html",
  styleUrls: ["./top-nav.component.css"],
})
export class TopNavComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }
  private authStatusSub: Subscription;

  constructor(private authService: AuthService) {}
  isAuth = false;
  userId: string;
  isDeveloper = true;
  homeUrl: string;
  userCategory: string;

  ngOnInit(): void {
    this.isAuth = this.authService.isUserAuth();
    this.userCategory = this.authService.getUserCategory();
    if (this.userCategory === "developer") {
      this.isDeveloper = true;
    } else {
      this.isDeveloper = false;
    }
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((emittedBoolean) => {
        this.isAuth = emittedBoolean;
        this.userCategory = this.authService.getUserCategory();
        if (this.userCategory === "developer") {
          this.isDeveloper = true;
        } else {
          this.isDeveloper = false;
        }
      });
    this.userId = this.authService.getUserId();
    if (this.isDeveloper) {
      this.homeUrl = "/developer/home";
    } else {
      this.homeUrl = "/user/home/" + this.userId;
    }
    console.log(this.isDeveloper);
  }

  onLogOut() {
    this.authService.logOutUser();
  }
}
