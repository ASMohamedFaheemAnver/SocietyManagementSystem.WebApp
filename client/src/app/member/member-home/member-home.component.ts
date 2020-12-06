import { Component, OnDestroy, OnInit } from "@angular/core";
import { MemberService } from "../member.service";
import { environment } from "src/environments/environment";
import { Log } from "src/app/log.model";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";

@Component({
  selector: "app-member-home",
  templateUrl: "./member-home.component.html",
  styleUrls: ["./member-home.component.css"],
})
export class MemberHomeComponent implements OnInit, OnDestroy {
  constructor(private memberService: MemberService) {}

  ngOnDestroy(): void {
    this.memberLogsSub.unsubscribe();
    this.memberStatusListennerSub.unsubscribe();
  }

  email: string;
  name: string;
  memberId: string;
  imageUrl = "";
  address: string;
  arrears: number;
  isLoading: boolean;
  isImageLoading: boolean;
  currentPage = 0;

  logs: Log[];
  logs_count: number;
  page_size = 10;
  page_size_options = [10, 15, 20];

  private memberLogsSub: Subscription;
  private memberStatusListennerSub: Subscription;
  private memberLogSub: Subscription;

  ngOnInit(): void {
    this.isImageLoading = true;
    this.isLoading = true;
    this.memberService.getMember().subscribe((member) => {
      this.email = member["data"]["getMember"].email;
      this.name = member["data"]["getMember"].name;
      this.memberId = member["data"]["getMember"]._id;
      this.imageUrl = member["data"]["getMember"].imageUrl;
      this.address = member["data"]["getMember"].address;
      this.arrears = member["data"]["getMember"].arrears;
      this.isLoading = false;
    });

    this.memberService.getMemberLogs(this.currentPage, this.page_size);

    this.memberLogsSub = this.memberService
      .getMemberLogsListenner()
      .subscribe((logsInfo) => {
        this.logs = logsInfo.logs;
        this.logs_count = logsInfo.logs_count;
      });

    this.memberStatusListennerSub = this.memberService
      .getMemberStatusListenner()
      .subscribe((isPassed) => {
        this.isLoading = false;
      });

    this.memberService.listenMemberLog();
  }

  changeDefaultUrl() {
    this.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded() {
    this.isImageLoading = false;
  }

  onPageChange(event: PageEvent) {
    console.log({ emitted: "onPageChange" });
    this.isLoading = true;
    if (
      this.page_size === event.pageSize &&
      this.currentPage === event.pageIndex
    ) {
      this.isLoading = false;
      return;
    }
    this.currentPage = event.pageIndex;
    this.page_size = event.pageSize;
    this.memberService.getMemberLogs(event.pageIndex, this.page_size);
  }
}
