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
  homeUrl: string = "./developer/home";
  userCategory: string;
  membersUrl: string;

  ngOnInit(): void {
    console.log({ emitted: "topNavComponent.ngOnInit" });
    this.isAuth = this.authService.isUserAuth();
    this.userCategory = this.authService.getUserCategory();

    if (this.userCategory === "developer") {
      this.isDeveloper = true;
    } else {
      this.isDeveloper = false;
    }
    if (this.isDeveloper) {
      this.homeUrl = "./developer/home";
    } else if (this.userCategory === "society") {
      this.homeUrl = "./society/home/";
      this.membersUrl = "./society/members";
    } else if (this.userCategory === "member") {
      this.homeUrl = "./member/home/";
      this.membersUrl = "./member/members";
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
        if (this.isDeveloper) {
          this.homeUrl = "./developer/home";
        } else if (this.userCategory === "society") {
          this.homeUrl = "./society/home/";
          this.membersUrl = "./society/members";
        } else if (this.userCategory === "member") {
          this.homeUrl = "./member/home/";
          this.membersUrl = "./member/members";
        }
      });
  }

  onLogOut() {
    this.authService.logOutUser();
  }
}
