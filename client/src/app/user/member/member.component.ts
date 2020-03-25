import { Component, OnInit, OnDestroy } from "@angular/core";
import { ParamMap, ActivatedRoute } from "@angular/router";
import { UserService } from "../user.service";
import { AuthService } from "src/app/auth/auth.service";
import { Subscription } from "rxjs";
import { User } from "../user.model";

@Component({
  selector: "app-member",
  templateUrl: "./member.component.html",
  styleUrls: ["./member.component.css"]
})
export class MemberComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.usersSub.unsubscribe();
  }
  private usersSub: Subscription;

  constructor(private userService: UserService) {}

  email: string;
  name: string;
  userId: string;
  imageUrl = "";
  address: string;
  arrears: number;
  users: User[] = [];

  ngOnInit(): void {
    this.userService.getAllUsers();
    this.usersSub = this.userService
      .getUserUpdateListener()
      .subscribe(users => {
        this.users = users;
      });
  }
}
