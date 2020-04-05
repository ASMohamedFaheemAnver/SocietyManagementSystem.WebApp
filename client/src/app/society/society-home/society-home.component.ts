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
    this.societyService.getOneSociety(this.societyId).subscribe(
      (society) => {
        console.log(society);
        this.email = society["data"].getOneSociety.email;
        this.name = society["data"].getOneSociety.name;
        this.imageUrl = society["data"].getOneSociety.imageUrl;
        this.address = society["data"].getOneSociety.address;
        this.regNo = society["data"].getOneSociety.regNo;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
      }
    );
  }
}
