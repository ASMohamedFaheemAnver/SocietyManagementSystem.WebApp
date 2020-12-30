import { Component, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Log } from "src/app/log.model";
import { Member } from "src/app/member.model";
import { MemberService } from "src/app/member/member.service";
import { SocietyService } from "../society.service";

@Component({
  selector: "app-society-member",
  templateUrl: "./society-member.component.html",
  styleUrls: ["./society-member.component.css"],
})
export class SocietyMemberComponent implements OnInit, OnDestroy {
  constructor(
    private memberService: MemberService,
    private route: ActivatedRoute,
    private router: Router,
    private societyService: SocietyService
  ) {}

  ngOnDestroy(): void {
    this.memberSub.unsubscribe();
  }

  isLoading: boolean;
  currentPage = 0;

  logs: Log[];
  logs_count: number = 0;
  page_size = 5;
  page_size_options = [5, 10, 15, 20];
  memberId;

  private memberLogsSub: Subscription;
  private societyStatusListennerSub: Subscription;
  private memberSub: Subscription;
  member: Member;

  ngOnInit(): void {
    // this.isLoading = true;

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("memberId")) {
        this.memberId = paramMap.get("memberId");

        this.memberSub = this.societyService
          .getMemberUpdateListener()
          .subscribe((member) => {
            console.log({
              emitted:
                "societyMemberComponent.ngOnInit.getMemberUpdateListener",
              member: member,
            });

            this.member = {
              ...member,
              isImageLoading: this.member ? this.member.isImageLoading : true,
            };
          });

        this.societyStatusListennerSub = this.societyService
          .getSocietyStatusListenner()
          .subscribe((isPassed) => {
            this.isLoading = false;
          });

        this.memberLogsSub = this.societyService
          .getMemberLogsListenner()
          .subscribe((logsInfo) => {
            console.log({
              emitted: "societyMemberComponent.ngOnInit.getMemberLogsListenner",
              logsInfo: logsInfo,
            });
            this.logs = logsInfo.logs;
            this.logs_count = logsInfo.logs_count;
          });

        this.societyService.getMemberById(this.memberId);
        this.societyService.getMemberLogsById(
          this.memberId,
          this.currentPage,
          this.page_size
        );
      } else {
        this.router.navigateByUrl(`/society/members`);
      }
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
