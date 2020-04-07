import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { SocietyService } from "../society.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-society-home",
  templateUrl: "./society-home.component.html",
  styleUrls: ["./society-home.component.css"],
})
export class SocietyHomeComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private authService: AuthService
  ) {}
  societyId: string;
  email: string;
  name: string;
  imageUrl: string;
  address: string;
  regNo: string;

  isLoading: Boolean;

  backeEndBaseUrl = environment.backeEndBaseUrl;

  ngOnInit(): void {
    this.isLoading = true;
    this.societyId = this.authService.getUserId();
    this.societyService.getSociety(this.societyId).subscribe(
      (society) => {
        console.log(society);
        this.email = society["data"].getSociety.email;
        this.name = society["data"].getSociety.name;
        this.imageUrl = society["data"].getSociety.imageUrl;
        this.address = society["data"].getSociety.address;
        this.regNo = society["data"].getSociety.regNo;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }
}
