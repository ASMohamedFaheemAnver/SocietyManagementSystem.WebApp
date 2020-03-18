import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";
import { AuthService } from "src/app/auth/auth.service";
import { ActivatedRoute, ParamMap } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  email: string;
  name: string;
  userId: string;
  imageUrl = "";

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("userId")) {
        this.userId = paramMap.get("userId");
        this.userService.getOneUser(this.userId).subscribe(user => {
          console.log(user);
          this.email = user["data"].getOneUser.email;
          this.name = user["data"].getOneUser.name;
          this.userId = user["data"].getOneUser._id;
          this.imageUrl = user["data"].getOneUser.imageUrl;
        });
      }
    });
  }
}
