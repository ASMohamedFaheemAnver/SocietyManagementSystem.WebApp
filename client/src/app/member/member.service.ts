import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Member } from "../member.model";
import { Log } from "../log.model";
import { Apollo, gql } from "apollo-angular";

@Injectable({ providedIn: "root" })
export class MemberService {
  constructor(private apollo: Apollo) {}
  private membersUpdated = new Subject<Member[]>();
  private memberUpdated = new Subject<Member>();
  private members: Member[] = [];
  private member: Member;
  private logs: Log[] = [];
  private logs_count: number;
  private memberStatusListenner = new Subject<boolean>();
  private logsUpdatedListener = new Subject<{
    logs: Log[];
    logs_count: number;
  }>();

  getMember() {
    const graphqlQuery = gql`
      query {
        getMember {
          email
          name
          imageUrl
          address
          arrears
        }
      }
    `;

    return this.apollo
      .query({
        query: graphqlQuery,
        fetchPolicy: "network-only",
      })
      .subscribe(
        (res) => {
          console.log({ emitted: "memberService.getMember", data: res });
          this.member = { ...res.data["getMember"] };
          this.memberUpdated.next({ ...this.member });
          this.memberStatusListenner.next(true);
        },
        (err) => {
          console.log(err);
          this.memberStatusListenner.next(false);
        }
      );
  }

  getMembersUpdateListener() {
    return this.membersUpdated.asObservable();
  }

  getMemberUpdateListener() {
    return this.memberUpdated.asObservable();
  }

  getMemberLogsListenner() {
    return this.logsUpdatedListener;
  }

  getMemberStatusListenner() {
    return this.memberStatusListenner;
  }

  getAllSocietyMembers() {
    const graphqlQuery = gql`
      query {
        getAllSocietyMembers {
          _id
          name
          email
          imageUrl
          address
          arrears
          approved
        }
      }
    `;

    this.apollo.query({ query: graphqlQuery }).subscribe(
      (res) => {
        this.members = res["data"]["getAllSocietyMembers"].map((member) => {
          return {
            ...member,
            isImageLoading: true,
            imageUrl: member["imageUrl"],
          };
        });
        this.membersUpdated.next([...this.members]);
        this.memberStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.memberStatusListenner.next(false);
      }
    );
  }

  getMemberLogs(page_number, page_size) {
    const graphqlQuery = gql`
      query{
        getMemberLogs(page_number: ${page_number}, page_size: ${page_size}){
          logs{
              _id
              kind
              fee{
                _id
                date
                amount
                description
              }
            }
          logs_count
          }
      }
    `;

    this.apollo
      .query({ query: graphqlQuery, fetchPolicy: "network-only" })
      .subscribe(
        (res) => {
          console.log({
            emitted: "memberService.getMemberLogs",
            data: res,
          });

          this.logs = res["data"]["getMemberLogs"].logs.map((log) => {
            return { ...log, fee: { ...log.fee } };
          });

          this.logs_count = res["data"]["getMemberLogs"].logs_count;
          this.logsUpdatedListener.next({
            logs: [...this.logs],
            logs_count: this.logs_count,
          });
          this.memberStatusListenner.next(false);
        },
        (err) => {
          console.log(err);
          this.memberStatusListenner.next(false);
        }
      );
  }

  listenMemberLog() {
    const graphqlQuery = gql`
      subscription listenMemberLog {
        listenMemberLog {
          log {
            _id
            kind
            fee {
              _id
              date
              amount
              description
            }
          }
          type
        }
      }
    `;

    const token = localStorage.getItem("token");

    this.apollo
      .subscribe({
        query: graphqlQuery,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
      .subscribe((res) => {
        console.log({
          emitted: "memberService.listenMemberLog.subscribe",
          data: res,
        });

        const rLog = res.data["listenMemberLog"];

        if (rLog.type === "POST") {
          this.logs.unshift(rLog.log);
          this.logsUpdatedListener.next({
            logs: [...this.logs],
            logs_count: ++this.logs_count,
          });

          this.member = {
            ...this.member,
            arrears: this.member.arrears + rLog.log.fee.amount,
          };

          this.memberUpdated.next({ ...this.member });
        } else if (rLog.type === "DELETE") {
          this.logs = this.logs.filter((log) => {
            if (log._id === rLog.log._id) {
              this.member = {
                ...this.member,
                arrears: this.member.arrears - log.fee.amount,
              };
              this.memberUpdated.next({ ...this.member });
              return false;
            }
            return true;
          });

          this.logsUpdatedListener.next({
            logs: [...this.logs],
            logs_count: --this.logs_count,
          });
        } else if (rLog.type === "PUT") {
          this.logs = this.logs.map((log) => {
            if (log._id === rLog.log._id) {
              this.member = {
                ...this.member,
                arrears:
                  this.member.arrears - log.fee.amount + rLog.log.fee.amount,
              };
              this.memberUpdated.next({ ...this.member });

              return {
                ...rLog.log,
                fee: { ...rLog.log.fee },
              };
            }
            return log;
          });

          this.logsUpdatedListener.next({
            logs: [...this.logs],
            logs_count: this.logs_count,
          });
        }
      });
  }
}
