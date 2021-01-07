import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { Member } from "../member.model";
import { Log } from "../log.model";
import { Society } from "../society.model";
import { Apollo, gql } from "apollo-angular";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class SocietyService {
  private societyStatusListenner = new Subject<boolean>();
  private membersUpdated = new Subject<Member[]>();
  private logsUpdated = new Subject<{ logs: Log[]; logs_count: number }>();
  private members: Member[] = [];
  private logs: Log[] = [];
  private logs_count: number;
  private offlineLog: Log;
  private society: Society;
  private newLog: Log;
  private societyUpdated = new Subject<Society>();
  private listenSocietyMembersBySocietySub: Subscription;
  private listenMemberByIdSub: Subscription;
  private memberLogsUpdated = new Subject<{
    logs: Log[];
    logs_count: number;
  }>();

  private member_logs: Log[] = [];
  private member_logs_count: number;

  private member: Member;
  private memberUpdated = new Subject<Member>();

  constructor(private apollo: Apollo, private router: Router) {}

  getSociety() {
    const graphqlQuery = gql`
      query {
        getSociety {
          _id
          name
          email
          imageUrl
          regNo
          address
          expected_income
          current_income
          number_of_members
          month_fee {
            amount
            description
          }
        }
      }
    `;

    this.apollo
      .query({ query: graphqlQuery, fetchPolicy: "network-only" })
      .subscribe(
        (res) => {
          this.society = {
            ...res["data"]["getSociety"],
            isImageLoading: true,
            imageUrl: res["data"]["getSociety"].imageUrl,
          };
          this.societyStatusListenner.next(false);
          this.societyUpdated.next({ ...this.society, isImageLoading: true });
        },
        (err) => {
          console.log(err);
          this.societyStatusListenner.next(false);
        }
      );
  }

  getSocietyProfile() {
    const graphqlQuery = gql`
      query {
        getSociety {
          _id
          name
          email
          imageUrl
          regNo
          address
          phoneNumber
        }
      }
    `;

    this.apollo
      .query({ query: graphqlQuery, fetchPolicy: "network-only" })
      .subscribe(
        (res) => {
          this.society = {
            ...res["data"]["getSociety"],
            isImageLoading: true,
            imageUrl: res["data"]["getSociety"].imageUrl,
          };
          this.societyStatusListenner.next(true);
          this.societyUpdated.next({ ...this.society, isImageLoading: true });
        },
        (err) => {
          console.log(err);
          this.societyStatusListenner.next(false);
        }
      );
  }

  getAllMembers() {
    const graphqlQuery = gql`
      query {
        getAllMembers {
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

    this.apollo
      .query({ query: graphqlQuery, fetchPolicy: "network-only" })
      .subscribe(
        (res) => {
          console.log({ emitted: "getAllMembers", data: res });
          this.members = res["data"]["getAllMembers"].map((member) => {
            return {
              ...member,
              imageUrl: member.imageUrl,
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

  getSocietyStatusListenner() {
    return this.societyStatusListenner;
  }

  getSocietyLogListenner() {
    return this.logsUpdated;
  }

  getMemberUpdateListener() {
    return this.memberUpdated.asObservable();
  }

  getMemberLogsUpdateListenner() {
    return this.memberLogsUpdated;
  }

  approveMember(memberId: string) {
    const graphqlQuery = gql`
      mutation{
        approveMember(memberId: "${memberId}"){
          message
        }
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
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
        this.societyStatusListenner.next(true);
      },
      (err) => {
        console.log(err);
        let updatedMembers = this.members;
        updatedMembers = updatedMembers.map((member) => {
          if (member._id === memberId) {
            member.isActionLoading = false;
          }
          return member;
        });
        this.members = updatedMembers;
        this.membersUpdated.next([...updatedMembers]);
        this.societyStatusListenner.next(false);
      }
    );
  }
  disApproveMember(memberId: string) {
    const graphqlQuery = gql`
      mutation{
        disApproveMember(memberId: "${memberId}"){
          message
        }
      }
    `;
    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
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

  addMonthlyFeeToEveryone(monthlyFee, description) {
    const graphqlQuery = gql`
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
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        this.newLog = res["data"]["addMonthlyFeeToEveryone"];
        this.logs.unshift(this.newLog);
        this.logsUpdated.next({
          logs: this.logs,
          logs_count: ++this.logs_count,
        });
        this.society.expected_income +=
          monthlyFee * this.society.number_of_members;
        this.societyUpdated.next({ ...this.society, isImageLoading: false });
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  addExtraFeeToEveryone(extraFee, description) {
    const graphqlQuery = gql`
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
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        this.newLog = res["data"]["addExtraFeeToEveryone"];
        this.logs.unshift(this.newLog);
        this.logsUpdated.next({
          logs: this.logs,
          logs_count: ++this.logs_count,
        });
        this.society.expected_income +=
          extraFee * this.society.number_of_members;
        this.societyUpdated.next({ ...this.society, isImageLoading: false });
        this.societyStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  getSocietyLogs(page_number, page_size) {
    const graphqlQuery = gql`
      query{
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
      }
    `;

    this.apollo
      .query({ query: graphqlQuery, fetchPolicy: "network-only" })
      .subscribe(
        (res) => {
          this.logs = res["data"]["getSocietyLogs"].logs.map((log) => {
            return {
              ...log,
              fee: {
                ...log.fee,
                tracks: [
                  ...log.fee.tracks.map((track) => {
                    return { ...track, member: { ...track.member } };
                  }),
                ],
              },
            };
          });

          this.logs_count = res["data"]["getSocietyLogs"].logs_count;
          this.logsUpdated.next({
            logs: [...this.logs],
            logs_count: this.logs_count,
          });
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

    return this.offlineLog;
  }

  makeFeePaidForOneMember(track_id: string, log_id: string) {
    console.log({ emitted: "makeFeePaidForOneMember" });
    if (!track_id) {
      return;
    }

    const graphqlQuery = gql`
      mutation{
        makeFeePaidForOneMember(track_id: "${track_id}", log_id: "${log_id}"){
          message
        }
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
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

        this.member_logs.map((log) => {
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

        this.society
          ? (this.society.current_income += this.logs.find((log) => {
              return log._id === log_id;
            }).fee.amount)
          : false;

        this.societyUpdated.next({ ...this.society, isImageLoading: false });

        this.member
          ? (this.member.arrears -= this.member_logs.find((log) => {
              return log._id === log_id;
            }).fee.amount)
          : false;

        this.memberUpdated.next({ ...this.member });

        this.logsUpdated.next({
          logs: [...this.logs],
          logs_count: this.logs_count,
        });

        this.memberLogsUpdated.next({
          logs: [...this.member_logs],
          logs_count: this.member_logs_count,
        });
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  makeFeeUnPaidForOneMember(track_id: string, log_id: string) {
    console.log({ emitted: "makeFeeUnPaidForOneMember" });

    if (!track_id) {
      return;
    }

    const graphqlQuery = gql`
      mutation{
        makeFeeUnPaidForOneMember(track_id: "${track_id}", log_id: "${log_id}"){
          message
        }
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
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

        this.member_logs.map((log) => {
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

        this.society
          ? (this.society.current_income -= this.logs.find((log) => {
              return log._id === log_id;
            }).fee.amount)
          : false;

        this.societyUpdated.next({ ...this.society, isImageLoading: false });

        this.member
          ? (this.member.arrears += this.member_logs.find((log) => {
              return log._id === log_id;
            }).fee.amount)
          : false;

        this.memberUpdated.next({ ...this.member });

        this.logsUpdated.next({
          logs: [...this.logs],
          logs_count: this.logs_count,
        });

        this.memberLogsUpdated.next({
          logs: [...this.member_logs],
          logs_count: this.member_logs_count,
        });
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  // Since Donation, Fine are following same shema as MonthFee, ExtraFee this will work perfectly fine
  editFeeForEveryone(log_id: string, fee: number, description: string) {
    // Checking whether log_id provided
    if (!log_id) {
      this.societyStatusListenner.next(false);
      return;
    }

    // Constructing gql
    const graphqlQuery = gql`
      mutation{
        editFeeForEveryone(log_id: "${log_id}", fee: ${fee}, description: "${description}"){
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
      }
    `;

    // Sending the request and listening to the response
    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        // Console logging server response
        console.log({
          emitted: "societyService.editFeeForEveryone",
          data: res,
        });

        // Changing the logs offline
        this.logs = this.logs.map((log) => {
          // We only changing one log which modified on server
          if (log._id === res["data"]["editFeeForEveryone"]._id) {
            for (let i = 0; i < log.fee.tracks.length; i++) {
              let track = log.fee.tracks[i];
              let modifiedTrack =
                res["data"]["editFeeForEveryone"].fee.tracks[i];

              // Checking whether track modified on server
              if (track.is_paid && !modifiedTrack.is_paid) {
                // If modified we need to change expected_income and current_income
                this.society.expected_income +=
                  res["data"]["editFeeForEveryone"].fee.amount;
                this.society.expected_income -= log.fee.amount;
                this.society.current_income -= log.fee.amount;
              } else {
                // If not modifed we only change expected_income
                if (log.kind !== "Donation") {
                  this.society.expected_income +=
                    res["data"]["editFeeForEveryone"].fee.amount;
                  this.society.expected_income -= log.fee.amount;
                }
              }
            }

            // Returning modified log to override existing offline log
            return res["data"]["editFeeForEveryone"];
          }
          // Returning non modified offline log as it is
          return log;
        });

        // Changing the member_logs offline
        this.member_logs = this.member_logs.map((log) => {
          // We only changing one log which modified on server
          if (log._id === res["data"]["editFeeForEveryone"]._id) {
            for (let i = 0; i < log.fee.tracks.length; i++) {
              let track = log.fee.tracks[i];
              let modifiedTrack =
                res["data"]["editFeeForEveryone"].fee.tracks[i];

              // Checking whether track modified on server
              if (track.is_paid && !modifiedTrack.is_paid) {
                // If modified we need to change expected_income and current_income
                this.member.arrears +=
                  res["data"]["editFeeForEveryone"].fee.amount;
              } else {
                if (log.kind !== "Donation") {
                  this.member.arrears -= log.fee.amount;
                  this.member.arrears +=
                    res["data"]["editFeeForEveryone"].fee.amount;
                }
              }
            }

            // Returning modified log to override existing offline log
            return res["data"]["editFeeForEveryone"];
          }
          // Returning non modified offline log as it is
          return log;
        });

        // Emitting member_logs updates
        this.memberLogsUpdated.next({
          logs: [...this.member_logs],
          logs_count: this.member_logs_count,
        });

        // Emitting member updates
        this.memberUpdated.next({ ...this.member });

        // Emitting society updates
        this.societyUpdated.next({
          ...this.society,
          isImageLoading: false,
        });

        // Emitting logs updates
        this.logsUpdated.next({
          logs: [...this.logs],
          logs_count: this.logs_count,
        });

        // Emitting society execution success message
        this.societyStatusListenner.next(true);
      },
      (err) => {
        console.log(err);
        // Emitting society execution failed message
        this.societyStatusListenner.next(false);
      }
    );
  }

  // Will delete all log by using it's id
  deleteFeeLog(log: Log) {
    console.log({
      emitted: "societyService.deleteFeeLog",
    });

    // Constructing gql
    const graphqlQuery = gql`
      mutation {
        deleteFeeLog(log_id: "${log._id}"){
          message
        }
      }
    `;

    // Sending the request and listening to the response
    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        // Filtering the logs to remove deleted log
        this.logs = this.logs.filter((tLog) => {
          if (tLog._id !== log._id) {
            return true;
          }
          return false;
        });

        // Filtering the member_logs to remove deleted log
        this.member_logs = this.member_logs.filter((tLog) => {
          if (tLog._id !== log._id) {
            return true;
          }
          return false;
        });

        // Modifying payment according to the category
        log.fee.tracks.forEach((track) => {
          if (log.kind !== "Donation") {
            if (track.is_paid) {
              this.society
                ? (this.society.current_income -= log.fee.amount)
                : false;
            } else {
              this.member ? (this.member.arrears -= log.fee.amount) : false;
            }
            this.society
              ? (this.society.expected_income -= log.fee.amount)
              : false;
          } else {
            this.society ? (this.society.donations -= log.fee.amount) : false;
            this.member ? (this.member.donations -= log.fee.amount) : false;
          }
        });

        // Emitting updated society
        this.societyUpdated.next({ ...this.society, isImageLoading: false });

        // Emitting updated member
        this.memberUpdated.next({ ...this.member });

        // Emitting updated logs
        this.logsUpdated.next({
          logs: this.logs,
          logs_count: --this.logs_count,
        });

        // Emitting updated member_logs
        this.memberLogsUpdated.next({
          logs: this.member_logs,
          logs_count: --this.member_logs_count,
        });

        // Emitting society execution success message
        this.societyStatusListenner.next(true);
      },
      (err) => {
        // Emitting society execution failed message
        this.societyStatusListenner.next(false);
        console.log(err);
      }
    );
  }

  addFineForOneMember(fine: number, description: string, member_id: string) {
    const graphqlQuery = gql`
      mutation {
        addFineForOneMember(fineInput: {fine: ${fine}, description: "${description}", member_id: "${member_id}"}) {
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
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        console.log({
          emitted: "societyService.addFineForOneMember",
          res: res,
        });

        this.members = this.members.map((member) => {
          if (member._id === member_id) {
            return {
              ...member,
              isActionLoading: false,
              arrears: member.arrears + fine,
            };
          }
          return member;
        });

        this.newLog = res["data"]["addFineForOneMember"];

        this.member_logs.unshift(this.newLog);

        this.memberLogsUpdated.next({
          logs: [...this.member_logs],
          logs_count: ++this.member_logs_count,
        });

        this.member
          ? (this.member = {
              ...this.member,
              isActionLoading: false,
              arrears: this.member.arrears + fine,
            })
          : false;

        this.memberUpdated.next({ ...this.member });

        this.societyStatusListenner.next(true);

        this.membersUpdated.next([...this.members]);
      },
      (err) => {
        this.societyStatusListenner.next(false);
        this.members = this.members.map((member) => {
          if (member._id === member_id) {
            return {
              ...member,
              isActionLoading: false,
            };
          }
          return member;
        });
        this.membersUpdated.next([...this.members]);
      }
    );
  }

  addRefinementFeeForOneMember(
    refinementFee: number,
    description: string,
    member_id: string
  ) {
    const graphqlQuery = gql`
      mutation {
        addRefinementFeeForOneMember(refinementFee: ${refinementFee}, description: "${description}", member_id: "${member_id}") {
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
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        console.log({
          emitted: "societyService.addRefinementFeeForOneMember",
          res: res,
        });

        this.newLog = res["data"]["addRefinementFeeForOneMember"];

        this.member_logs.unshift(this.newLog);

        this.memberLogsUpdated.next({
          logs: this.member_logs,
          logs_count: ++this.member_logs_count,
        });

        this.member = {
          ...this.member,
          isActionLoading: false,
          arrears: this.member.arrears + refinementFee,
        };

        this.societyStatusListenner.next(true);
        this.memberUpdated.next({ ...this.member });
      },
      (err) => {
        this.societyStatusListenner.next(false);
        this.members = this.members.map((member) => {
          if (member._id === member_id) {
            return {
              ...member,
              isActionLoading: false,
            };
          }
          return member;
        });
        this.membersUpdated.next([...this.members]);
      }
    );
  }

  addDonationForOneMember(
    donation: number,
    description: string,
    member_id: string
  ) {
    const graphqlQuery = gql`
      mutation {
        addDonationForOneMember(donationInput: {donation: ${donation}, description: "${description}", member_id: "${member_id}"}) {
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
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        console.log({
          emitted: "societyService.addDonationForOneMember",
          res: res,
        });

        this.members = this.members.map((member) => {
          if (member._id === member_id) {
            return {
              ...member,
              isActionLoading: false,
            };
          }
          return member;
        });

        this.newLog = res["data"]["addDonationForOneMember"];

        this.member_logs.unshift(this.newLog);

        this.memberLogsUpdated.next({
          logs: [...this.member_logs],
          logs_count: ++this.member_logs_count,
        });

        this.societyStatusListenner.next(true);

        this.membersUpdated.next([...this.members]);
      },
      (err) => {
        this.societyStatusListenner.next(false);
        this.members = this.members.map((member) => {
          if (member._id === member_id) {
            return {
              ...member,
              isActionLoading: false,
            };
          }
          return member;
        });
        this.membersUpdated.next([...this.members]);
      }
    );
  }

  addReceivedDonationBySociety(donation: number, description: string) {
    const graphqlQuery = gql`
      mutation {
        addReceivedDonationBySociety(donationInput: {donation: ${donation}, description: "${description}"}) {
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
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        console.log({
          emitted: "societyService.addReceivedDonationBySociety",
          res: res,
        });
        this.newLog = res["data"]["addReceivedDonationBySociety"];

        this.logs.unshift(this.newLog);
        this.logsUpdated.next({
          logs: this.logs,
          logs_count: ++this.logs_count,
        });

        this.society.donations += donation;
        this.societyUpdated.next({ ...this.society, isImageLoading: false });

        this.societyStatusListenner.next(true);
      },
      (err) => {
        this.societyStatusListenner.next(false);
      }
    );
  }

  addSocietyExpense(expense: number, description: string) {
    const graphqlQuery = gql`
      mutation {
        addSocietyExpense(expenseInput: {expense: ${expense}, description: "${description}"}) {
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
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        console.log({
          emitted: "societyService.addSocietyExpense",
          res: res,
        });
        this.newLog = res["data"]["addSocietyExpense"];

        this.logs.unshift(this.newLog);
        this.logsUpdated.next({
          logs: this.logs,
          logs_count: ++this.logs_count,
        });

        this.society.expenses += expense;
        this.societyUpdated.next({ ...this.society, isImageLoading: false });

        this.societyStatusListenner.next(true);
      },
      (err) => {
        this.societyStatusListenner.next(false);
      }
    );
  }

  listenSocietyMembersBySociety() {
    console.log({ emitted: "societyService.listenSocietyMembersBySociety" });

    const graphqlQuery = gql`
      subscription listenSocietyMembersBySociety {
        listenSocietyMembersBySociety {
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

    this.listenSocietyMembersBySocietySub = this.apollo
      .subscribe({
        query: graphqlQuery,
      })
      .subscribe((res) => {
        console.log({
          emitted: "societyService.listenSocietyMembersBySociety",
          data: res,
        });

        const data = res.data["listenSocietyMembersBySociety"];

        if (data.type === "POST") {
          const isMemberExist = this.members.some((member) => {
            return data.member._id === member._id;
          });

          if (isMemberExist) {
            return;
          }

          this.members.push({
            ...data.member,
          });
          this.membersUpdated.next([...this.members]);
        } else if (data.type === "PUT") {
          this.members = this.members.map((member) => {
            if (member._id === data.member._id) {
              return { ...data.member };
            }
            return member;
          });

          this.membersUpdated.next([...this.members]);
        }
      });
  }

  listenMemberById(member_id: string) {
    console.log({ emitted: "societyService.listenMemberById" });

    const graphqlQuery = gql`
      subscription listenMemberById {
        listenMemberById(member_id: "${member_id}") {
          member {
            _id
            name
            email
            imageUrl
            address
            phoneNumber
          }
          type
        }
      }
    `;

    this.listenMemberByIdSub = this.apollo
      .subscribe({
        query: graphqlQuery,
      })
      .subscribe((res) => {
        console.log({
          emitted: "societyService.listenMemberByIdSub",
          data: res,
        });

        const data = res.data["listenMemberById"];
        if (data.type === "PUT") {
          this.member = { ...data.member };
          this.memberUpdated.next({ ...this.member });
        }
      });
  }

  getMemberById(member_id: string) {
    console.log({ emitted: "societyService.getMemberById" });
    const graphqlQuery = gql`
      query {
        getMemberById(member_id: "${member_id}") {
          _id
          email
          name
          imageUrl
          address
          arrears
          donations
          approved
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
          console.log({ emitted: "societyService.getMemberById", data: res });
          this.member = { ...res.data["getMemberById"] };
          this.memberUpdated.next({ ...this.member });
          this.societyStatusListenner.next(true);
        },
        (err) => {
          console.log(err);
          this.societyStatusListenner.next(false);
        }
      );
  }

  getMemberLogsById(member_id, page_number, page_size) {
    console.log({ emitted: "societyService.getMemberLogsById" });
    const graphqlQuery = gql`
      query{
        getMemberLogsById(member_id: "${member_id}",page_number: ${page_number}, page_size: ${page_size}){
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
            emitted: "societyService.getMemberLogsById",
            data: res,
          });

          this.member_logs = res["data"]["getMemberLogsById"].logs.map(
            (log) => {
              return {
                ...log,
                fee: {
                  ...log.fee,
                  tracks: log.fee.tracks.map((track) => {
                    return { ...track, member: { _id: member_id } };
                  }),
                },
              };
            }
          );

          this.member_logs_count = res["data"]["getMemberLogsById"].logs_count;
          this.memberLogsUpdated.next({
            logs: [...this.member_logs],
            logs_count: this.member_logs_count,
          });
          this.societyStatusListenner.next(false);
        },
        (err) => {
          console.log(err);
          this.societyStatusListenner.next(false);
        }
      );
  }

  deleteSocietyMemberById(member_id: string) {
    console.log({ emitted: "societyService.deleteSocietyMemberById" });
    const graphqlQuery = gql`
      mutation {
        deleteSocietyMember(member_id: "${member_id}") {
          message
        }
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        this.router.navigateByUrl(`/society/members`);
      },
      (err) => {
        console.log(err);
        this.societyStatusListenner.next(false);
      }
    );
  }

  unSubscribeListenSocietyMembersBySociety() {
    if (this.listenSocietyMembersBySocietySub) {
      console.log({
        emitted: "societyService.unSubscribeListenSocietyMembersBySociety",
      });
      this.listenSocietyMembersBySocietySub.unsubscribe();
    }
  }

  unSubscribeListenMemberById() {
    if (this.listenMemberByIdSub) {
      console.log({
        emitted: "societyService.unSubscribeListenMemberById",
      });
      this.listenMemberByIdSub.unsubscribe();
    }
  }

  updateSocietyProfile({ name, image, address, regNo, phoneNumber }) {
    console.log({
      emitted: "societyService.updateSocietyProfile",
    });

    const graphqlQuery = gql`
      mutation updateSocietyProfileMutation($image: Upload!) {
        updateSocietyProfile(societyProfileInput: {
          name: "${name}",
          address: """${address}""",
          phoneNumber: "${phoneNumber}",
          image: $image
          regNo: "${regNo}"}){
          message
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: graphqlQuery,
        variables: { image: image },
        context: { useMultipart: true },
      })
      .subscribe(
        (res) => {
          console.log({
            emitted: "societyService.updateSocietyProfile.subscribe",
            res: res,
          });

          this.router.navigateByUrl(`/society/home`);
          this.societyStatusListenner.next(true);
        },
        (err) => {
          console.log(err);
          this.societyStatusListenner.next(false);
        }
      );
  }
}
