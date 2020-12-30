import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Log } from "src/app/log.model";
import { Member } from "src/app/member.model";
import { MemberService } from "src/app/member/member.service";

@Component({
  selector: "app-society-member",
  templateUrl: "./society-member.component.html",
  styleUrls: ["./society-member.component.css"],
})
export class SocietyMemberComponent implements OnInit, OnDestroy {
  memberId;

  constructor(
    private memberService: MemberService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.memberLogsSub.unsubscribe();
    this.memberStatusListennerSub.unsubscribe();
    this.memberSub.unsubscribe();

    this.memberService.unSubscribeListenCommonMemberLog();
    this.memberService.unSubscribeListenMemberLogTrack();
    this.memberService.unSubscribelistenMemberFineLog();
    this.memberService.unSubscribelistenMemberDonationLog();
  }

  isLoading: boolean;
  currentPage = 0;

  logs: Log[];
  logs_count: number;
  page_size = 5;
  page_size_options = [5, 10, 15, 20];

  private memberLogsSub: Subscription;
  private memberStatusListennerSub: Subscription;
  private memberSub: Subscription;
  member: Member;

  ngOnInit(): void {
    // this.isLoading = true;

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("memberId")) {
        this.memberId = paramMap.get("memberId");
      } else {
        this.router.navigateByUrl(`/society/members`);
      }
    });

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
        console.log({
          emitted: "memberHomeComponent.ngOnInit.getMemberUpdateListener",
          member: member,
        });

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
