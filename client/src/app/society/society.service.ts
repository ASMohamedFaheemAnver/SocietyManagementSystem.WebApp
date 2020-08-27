import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";
import { Member } from "../member.model";
import { Log } from "../log.model";

@Injectable({ providedIn: "root" })
export class SocietyService {
  private graphQLUrl = environment.backEndGraphQlUrl2;
  private societyStatusListenner = new Subject<boolean>();
  private membersUpdated = new Subject<Member[]>();
  private logsUpdated = new Subject<Log[]>();
  private members: Member[] = [];
  private logs: Log[] = [];
  backeEndBaseUrl = environment.backeEndBaseUrl2;
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
        }
      }`,
    };
    return this.http.post(this.graphQLUrl, graphqlQuery);
  }

  getSocietyMonthlyFee() {
    const graphqlQuery = {
      query: `{
        getSociety{
   	      month_fee{
             amount
             description
           }
        }
      }`,
    };
    return this.http.post(this.graphQLUrl, graphqlQuery);
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
            isLoading: true,
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
          message
        }
      }`,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe((res) => {
      console.log(res);
      this.societyStatusListenner.next(false);
    });
  }

  addExtraFeeToEveryone(extraFee, description) {
    console.log(extraFee);
    const graphqlQuery = {
      query: `
      mutation{
        addExtraFeeToEveryone(extraFee: ${extraFee}, description: "${description}"){
          message
        }
      }`,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe((res) => {
      console.log(res);
      this.societyStatusListenner.next(false);
    });
  }

  getSocietyLogs(page_number) {
    console.log(page_number);
    const graphqlQuery = {
      query: `{
        getSocietyLogs(page_number: ${page_number}){
          _id
          kind
          fee{
            _id
            date
            amount
            description
          }
        }
      }`,
    };
    // const graphqlQuery = {
    //   query: `
    //   mutation{
    //     getSocietyLogs(page_number: ${page_number}){
    //       _id
    //     }
    //   }`,
    // };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe((res: Log[]) => {
      console.log(res);
      this.logs = res["data"].getSocietyLogs;
      this.logsUpdated.next(this.logs);
      this.societyStatusListenner.next(false);
    });
  }
}
