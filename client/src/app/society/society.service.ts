import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Subject } from "rxjs";
import { Member } from "./society-members/member.model";

@Injectable({ providedIn: "root" })
export class SocietyService {
  private graphQLUrl = environment.backEndGraphQlUrl;
  private societyStatusListenner = new Subject<boolean>();
  private membersUpdated = new Subject<Member[]>();
  private members: Member[] = [];

  constructor(private http: HttpClient) {}

  getOneSociety(societyId: string) {
    const graphqlQuery = {
      query: `{
        getOneSociety(societyId: "${societyId}"){
   	      _id
          name
          email
          imageUrl
          regNo
          address
        }
      }`,
    };
    return this.http.post(this.graphQLUrl, graphqlQuery);
  }

  getAllSocietyMembers(societyId: string) {
    console.log(societyId);
    const graphqlQuery = {
      query: `{
        getAllSocietyMembers(societyId: "${societyId}"){
   	      _id
          name
          email
          imageUrl
          address
          arrears
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        this.members = res["data"].getAllSocietyMembers;
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
}
