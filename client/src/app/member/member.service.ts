import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
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
  private listenCommonMemberLogSub: Subscription;
  private listenMemberLogTrackSub: Subscription;
  private listenMemberFineLogSub: Subscription;
  private listenSocietyMembersSub: Subscription;

  getMember() {
    console.log({ emitted: "memberService.getMember" });
    const graphqlQuery = gql`
      query {
        getMember {
          _id
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
    console.log({ emitted: "memberService.getAllSocietyMembers" });
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
    console.log({ emitted: "memberService.getMemberLogs" });
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
                tracks {
                  _id
                  is_paid
                }
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

  listenCommonMemberLog() {
    console.log({ emitted: "memberService.listenCommonMemberLog" });
    const graphqlQuery = gql`
      subscription listenCommonMemberLog {
        listenCommonMemberLog {
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
          is_fee_mutated
        }
      }
    `;

    this.listenCommonMemberLogSub = this.apollo
      .subscribe({
        query: graphqlQuery,
      })
      .subscribe((res) => {
        console.log({
          emitted: "memberService.listenCommonMemberLog.subscribe",
          data: res,
        });

        const rLog = res.data["listenCommonMemberLog"];
        if (rLog.type === "POST") {
          const isExist = this.logs.some((log) => {
            return log._id === rLog.log._id;
          });

          if (isExist) {
            return;
          }

          this.logs.unshift({
            ...rLog.log,
            fee: {
              ...rLog.log.fee,
              tracks: [{ is_paid: false, _id: "undefined" }],
            },
          });
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
              if (!log.fee.tracks[0].is_paid) {
                this.member = {
                  ...this.member,
                  arrears:
                    this.member.arrears - log.fee.amount + rLog.log.fee.amount,
                };

                return {
                  ...rLog.log,
                  fee: {
                    ...rLog.log.fee,
                    tracks: [{ ...log.fee.tracks[0] }],
                  },
                };
              } else {
                if (rLog.is_fee_mutated) {
                  this.member = {
                    ...this.member,
                    arrears: this.member.arrears + rLog.log.fee.amount,
                  };

                  return {
                    ...rLog.log,
                    fee: {
                      ...rLog.log.fee,
                      tracks: [{ ...log.fee.tracks[0], is_paid: false }],
                    },
                  };
                }

                return {
                  ...rLog.log,
                  fee: {
                    ...rLog.log.fee,
                    tracks: [{ ...log.fee.tracks[0] }],
                  },
                };
              }
            }
            return log;
          });

          this.memberUpdated.next({ ...this.member });

          this.logsUpdatedListener.next({
            logs: [...this.logs],
            logs_count: this.logs_count,
          });
        }
      });
  }

  listenMemberLogTrack() {
    console.log({ emitted: "memberService.listenMemberLogTrack" });

    const graphqlQuery = gql`
      subscription listenMemberLogTrack {
        listenMemberLogTrack {
          log {
            _id
            fee {
              _id
              amount
              tracks {
                is_paid
                _id
              }
            }
          }
          type
        }
      }
    `;

    this.listenMemberLogTrackSub = this.apollo
      .subscribe({
        query: graphqlQuery,
      })
      .subscribe(
        (res) => {
          console.log({
            emitted: "memberService.listenMemberLogTrack.subscribe",
            data: res,
          });

          const rLog = res.data["listenMemberLogTrack"]["log"];

          this.logs = this.logs.map((log) => {
            if (log._id === rLog._id) {
              if (!log.fee.tracks[0].is_paid && rLog.fee.tracks[0].is_paid) {
                this.member.arrears -= rLog.fee.amount;
              } else {
                this.member.arrears += rLog.fee.amount;
              }

              return {
                ...log,
                fee: { ...log.fee, tracks: [...rLog.fee.tracks] },
              };
            }
            return log;
          });

          this.memberUpdated.next({ ...this.member });
        },
        (err) => {
          console.log(err);
        }
      );
  }

  listenMemberFineLog() {
    const graphqlQuery = gql`
      subscription listenMemberFineLog {
        listenMemberFineLog {
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
          is_fee_mutated
        }
      }
    `;

    this.listenMemberFineLogSub = this.apollo
      .subscribe({ query: graphqlQuery })
      .subscribe((res) => {
        console.log({
          emitted: "memberService.listenMemberFineLog.subscribe",
          data: res,
        });

        const rLog = res.data["listenMemberFineLog"];

        if (rLog.type === "POST") {
          const isExist = this.logs.some((log) => {
            return log._id === rLog.log._id;
          });

          if (isExist) {
            return;
          }

          this.logs.unshift({
            ...rLog.log,
            fee: {
              ...rLog.log.fee,
              tracks: [{ is_paid: false, _id: "undefined" }],
            },
          });
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
              if (!log.fee.tracks[0].is_paid) {
                this.member = {
                  ...this.member,
                  arrears:
                    this.member.arrears - log.fee.amount + rLog.log.fee.amount,
                };

                return {
                  ...rLog.log,
                  fee: {
                    ...rLog.log.fee,
                    tracks: [{ ...log.fee.tracks[0] }],
                  },
                };
              } else {
                if (rLog.is_fee_mutated) {
                  this.member = {
                    ...this.member,
                    arrears: this.member.arrears + rLog.log.fee.amount,
                  };

                  return {
                    ...rLog.log,
                    fee: {
                      ...rLog.log.fee,
                      tracks: [{ ...log.fee.tracks[0], is_paid: false }],
                    },
                  };
                }

                return {
                  ...rLog.log,
                  fee: {
                    ...rLog.log.fee,
                    tracks: [{ ...log.fee.tracks[0] }],
                  },
                };
              }
            }
            return log;
          });

          this.memberUpdated.next({ ...this.member });

          this.logsUpdatedListener.next({
            logs: [...this.logs],
            logs_count: this.logs_count,
          });
        }
      });
  }

  listenSocietyMembers() {
    console.log({ emitted: "memberService.listenSocietyMembers" });

    const graphqlQuery = gql`
      subscription listenSocietyMembers {
        listenSocietyMembers {
          member {
            _id
            name
            email
            imageUrl
            address
            arrears
            approved
          }
          type
        }
      }
    `;

    this.listenSocietyMembersSub = this.apollo
      .subscribe({
        query: graphqlQuery,
      })
      .subscribe((res) => {
        console.log({
          emitted: "memberService.listenSocietyMembers",
          data: res,
        });

        this.members = this.members.map((member) => {
          if (member._id === res.data["listenSocietyMembers"].member._id) {
            return { ...res.data["listenSocietyMembers"].member };
          }
          return member;
        });

        this.membersUpdated.next([...this.members]);
      });
  }

  unSubscribeListenCommonMemberLog() {
    if (this.listenCommonMemberLogSub) {
      console.log({
        emitted: "societyService.unSubscribeListenCommonMemberLog",
      });
      this.listenCommonMemberLogSub.unsubscribe();
    }
  }
  unSubscribeListenMemberLogTrack() {
    if (this.listenMemberLogTrackSub) {
      console.log({
        emitted: "societyService.unSubscribeListenMemberLogTrack",
      });
      this.listenMemberLogTrackSub.unsubscribe();
    }
  }
  unSubscribelistenMemberFineLog() {
    if (this.listenMemberFineLogSub) {
      console.log({
        emitted: "societyService.unSubscribelistenMemberFineLog",
      });
      this.listenMemberFineLogSub.unsubscribe();
    }
  }
  unSubscribelistenSocietyMembers() {
    if (this.listenSocietyMembersSub) {
      console.log({
        emitted: "societyService.unSubscribelistenSocietyMembers",
      });
      this.listenSocietyMembersSub.unsubscribe();
    }
  }
}
