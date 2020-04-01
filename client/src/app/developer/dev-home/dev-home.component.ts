import { Component, OnInit } from "@angular/core";
import { DevService } from "../dev.service";

@Component({
  selector: "app-dev-home",
  templateUrl: "./dev-home.component.html",
  styleUrls: ["./dev-home.component.css"]
})
export class DevHomeComponent implements OnInit {
  constructor(private devService: DevService) {}
  societies = [];
  ngOnInit(): void {
    this.devService.getAllSociety().subscribe(res => {
      this.societies = res["data"].getAllSocieties;
    });
  }
}
