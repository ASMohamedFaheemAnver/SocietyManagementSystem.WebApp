import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";
import { Member } from "../member.model";
import { Log } from "../log.model";
import { Society } from "../society.model";

@Injectable({ providedIn: "root" })
export class SocietyService {
  private graphQLUrl = environment.backEndGraphQlUrl2;
  private societyStatusListenner = new Subject<boolean>();
  private membersUpdated = new Subject<Member[]>();
  private logsUpdated = new Subject<{ logs: Log[]; logs_count: number }>();
  private members: Member[] = [];
  private logs: Log[] = [];
  private offlineLog: Log;
  private backeEndBaseUrl = environment.backeEndBaseUrl2;
  private society: Society;
  private newLog: Log;
  private logUpdated = new Subject<Log>();
  private societyUpdated = new Subject<Society>();

  constructor(private http: HttpClient) {}

  getSociety() {
    const graphqlQuery = {
      query: `{
        getSociety{
   	      _id
          name
          email
          imageUrl
          regNo
          address
          expected_income
          current_income
          number_of_members
          month_fee{
             amount
             description
           }
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        this.society = {
          ...res["data"].getSociety,
          isImageLoading: true,
          imageUrl: this.backeEndBaseUrl + res["data"].getSociety.imageUrl,
        };
        this.societyStatusListenner.next(false);
        this.societyUpdated.next(this.society);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  getAllMembers() {
    const graphqlQuery = {
      query: `{
        getAllMembers{
   	      _id
          name
          email
          imageUrl
          address
          arrears
          approved
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        this.members = res["data"].getAllMembers.map((member) => {
          return {
            ...member,
            imageUrl: this.backeEndBaseUrl + member.imageUrl,
            isImageLoading: true,
          };
        });
        this.membersUpdated.next([...this.members]);
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  getMembersUpdateListenner() {
    return this.membersUpdated;
  }

  getSocietyUpdatedListenner() {
    return this.societyUpdated;
  }

  getlogUpdatedLintenner() {
    return this.logUpdated;
  }

  getSocietyStatusListenner() {
    return this.societyStatusListenner;
  }

  getSocietyLogListenner() {
    return this.logsUpdated;
  }

  approveMember(memberId: string) {
    const graphqlQuery = {
      query: `
      mutation{
        approveMember(memberId: "${memberId}"){
          message
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        let updatedMembers = this.members;
        updatedMembers = updatedMembers.map((member) => {
          if (member._id === memberId) {
            member.approved = true;
            member.isActionLoading = false;
          }
          return member;
        });
        this.members = updatedMembers;
        this.membersUpdated.next([...updatedMembers]);
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }
  disApproveMember(memberId: string) {
    const graphqlQuery = {
      query: `
      mutation{
        disApproveMember(memberId: "${memberId}"){
          message
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        let updatedMembers = this.members;
        updatedMembers = updatedMembers.map((member) => {
          if (member._id === memberId) {
            member.approved = false;
            member.isActionLoading = false;
          }
          return member;
        });
        this.members = updatedMembers;
        this.membersUpdated.next([...updatedMembers]);
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  deleteMember(memberId: string) {
    const graphqlQuery = {
      query: `
      mutation{
        deleteMember(memberId: "${memberId}"){
          message
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        let updatedMembers = this.members;
        updatedMembers = updatedMembers.filter((member) => {
          return member._id !== memberId;
        });
        this.members = updatedMembers;
        this.membersUpdated.next([...updatedMembers]);
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  addMonthlyFeeToEveryone(monthlyFee, description) {
    console.log(monthlyFee);
    const graphqlQuery = {
      query: `
      mutation{
        addMonthlyFeeToEveryone(monthlyFee: ${monthlyFee}, description: "${description}"){
          _id
          kind
          fee{
            _id
            amount
            date
            description
            tracks{
                  _id
                  member{
                    _id
                    imageUrl
                    name
                  }
                  is_paid
                }
          }
        }
      }`,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        this.newLog = res["data"].addMonthlyFeeToEveryone;
        this.logUpdated.next(this.newLog);
        this.society.expected_income +=
          monthlyFee * this.society.number_of_members;
        this.societyUpdated.next(this.society);
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  addExtraFeeToEveryone(extraFee, description) {
    console.log(extraFee);
    const graphqlQuery = {
      query: `
      mutation{
        addExtraFeeToEveryone(extraFee: ${extraFee}, description: "${description}"){
          _id
          kind
          fee{
            _id
            amount
            date
            description
            tracks{
                _id
                member{
                _id
                imageUrl
                name
                }
                is_paid
              }
          }
        }
      }`,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        this.newLog = res["data"].addExtraFeeToEveryone;
        this.logUpdated.next(this.newLog);
        this.society.expected_income +=
          extraFee * this.society.number_of_members;
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  getSocietyLogs(page_number, page_size) {
    console.log(page_number);
    const graphqlQuery = {
      query: `{
        getSocietyLogs(page_number: ${page_number}, page_size: ${page_size}){
          logs{
              _id
              kind
              fee{
                _id
                date
                amount
                description
                tracks{
                  _id
                  member{
                    _id
                    imageUrl
                    name
                  }
                  is_paid
                }
              }
            }
          logs_count
          }
      }`,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res: Log[]) => {
        console.log(res);
        this.logs = res["data"].getSocietyLogs.logs;
        const logs_count = res["data"].getSocietyLogs.logs_count;
        this.logsUpdated.next({ logs: this.logs, logs_count: logs_count });
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  getOneSocietyOfflineLog(log_id: string) {
    if (this.logs.length === 0) {
      return;
    }

    this.offlineLog = this.logs.find((log) => {
      return log._id === log_id;
    });

    console.log(this.offlineLog);

    return this.offlineLog;
  }

  makeFeePaidForOneMember(track_id: string, log_id: string) {
    if (!track_id) {
      return;
    }

    const graphqlQuery = {
      query: `
      mutation{
        makeFeePaidForOneMember(track_id: "${track_id}", log_id: "${log_id}"){
          message
        }
      }`,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log({
          oneMakeFeePaidForOneMember: res["data"].makeFeePaidForOneMember,
        });

        this.logs.map((log) => {
          return {
            ...log,
            fee: {
              ...log.fee,
              tracks: log.fee.tracks.map((track) => {
                if (track._id === track_id) {
                  track.is_paid = true;
                }
                return track;
              }),
            },
          };
        });

        this.society.current_income += this.logs.find((log) => {
          return log._id === log_id;
        }).fee.amount;

        this.societyUpdated.next(this.society);

        this.logsUpdated.next({
          logs: this.logs,
          logs_count: this.logs.length,
        });
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  makeFeeUnPaidForOneMember(track_id: string, log_id: string) {
    if (!track_id) {
      return;
    }

    const graphqlQuery = {
      query: `
      mutation{
        makeFeeUnPaidForOneMember(track_id: "${track_id}", log_id: "${log_id}"){
          message
        }
      }`,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log({
          oneMakeFeePaidForOneMember: res["data"].makeFeePaidForOneMember,
        });

        this.logs.map((log) => {
          return {
            ...log,
            fee: {
              ...log.fee,
              tracks: log.fee.tracks.map((track) => {
                if (track._id === track_id) {
                  track.is_paid = false;
                }
                return track;
              }),
            },
          };
        });

        this.society.current_income -= this.logs.find((log) => {
          return log._id === log_id;
        }).fee.amount;

        this.societyUpdated.next(this.society);

        this.logsUpdated.next({
          logs: this.logs,
          logs_count: this.logs.length,
        });
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }
}
