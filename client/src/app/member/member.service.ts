import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Member } from "./member.model";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class MemberService {
  constructor(private http: HttpClient) {}
  private graphQLUrl = environment.backEndGraphQlUrl2;
  private usersUpdated = new Subject<Member[]>();
  private users: Member[] = [];

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

  getAllMembers() {
    const graphqlQuery = {
      query: `
        {
          getAllSocietyMembers{
  	        email
            name
            imageUrl
            address
          }
        }
      `,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe((res) => {
      this.users = res["data"].getAllUsers;
      this.usersUpdated.next([...this.users]);
    });
  }

  getUserUpdateListener() {
    return this.usersUpdated.asObservable();
  }
}
