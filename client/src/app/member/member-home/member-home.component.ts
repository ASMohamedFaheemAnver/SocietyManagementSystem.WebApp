import { Component, OnDestroy, OnInit } from "@angular/core";
import { MemberService } from "../member.service";
import { environment } from "src/environments/environment";
import { Log } from "src/app/log.model";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { Member } from "src/app/member.model";

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

  isLoading: boolean;
  currentPage = 0;

  logs: Log[];
  logs_count: number;
  page_size = 10;
  page_size_options = [10, 15, 20];

  private memberLogsSub: Subscription;
  private memberStatusListennerSub: Subscription;
  private memberSub: Subscription;
  member: Member;

  ngOnInit(): void {
    this.isLoading = true;
    this.memberService.getMember();

    this.memberService.getMemberLogs(this.currentPage, this.page_size);

    this.memberLogsSub = this.memberService
      .getMemberLogsListenner()
      .subscribe((logsInfo) => {
        console.log({
          emitted: "memberHomeComponent.ngOnInit.getMemberLogsListenner",
          logsInfo: logsInfo,
        });
        this.logs = logsInfo.logs;
        this.logs_count = logsInfo.logs_count;
      });

    this.memberSub = this.memberService
      .getMemberUpdateListener()
      .subscribe((member) => {
        this.member = {
          ...member,
          isImageLoading: this.member ? this.member.isImageLoading : true,
        };
      });

    this.memberStatusListennerSub = this.memberService
      .getMemberStatusListenner()
      .subscribe((isPassed) => {
        this.isLoading = false;
      });

    this.memberService.listenCommonMemberLog();
    this.memberService.listenMemberLogTrack();
    this.memberService.listenMemberFineLog();
  }

  changeDefaultUrl() {
    this.member.imageUrl = "./assets/img/invalid-img.jpg";
  }

  onImageLoaded() {
    this.member.isImageLoading = false;
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
