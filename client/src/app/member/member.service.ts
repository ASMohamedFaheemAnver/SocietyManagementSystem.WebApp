import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { Member } from "../member.model";

@Injectable({ providedIn: "root" })
export class MemberService {
  constructor(private http: HttpClient) {}
  private graphQLUrl = environment.backEndGraphQlUrl2;
  private membersUpdated = new Subject<Member[]>();
  private members: Member[] = [];
  private memberStatusListenner = new Subject<boolean>();

  private backeEndBaseUrl = environment.backeEndBaseUrl2;

  getMember() {
    const graphqlQuery = {
      query: `
        {
          getMember{
  	        email
            name
            imageUrl
            address
            arrears
          }
        }
      `,
    };

    return this.http.post(this.graphQLUrl, graphqlQuery);
  }

  getMemberUpdateListener() {
    return this.membersUpdated.asObservable();
  }

  getMemberStatusListenner() {
    return this.memberStatusListenner;
  }

  getAllSocietyMembers() {
    const graphqlQuery = {
      query: `{
        getAllSocietyMembers{
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
        this.members = res["data"].getAllSocietyMembers.map((member) => {
          return {
            ...member,
            isLoading: true,
            imageUrl: this.backeEndBaseUrl + member["imageUrl"],
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
}
