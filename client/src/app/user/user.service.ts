import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "./user.model";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}
  private graphQLUrl = "http://localhost:3000/graphql";
  private usersUpdated = new Subject<User[]>();
  private users: User[] = [];

  getOneUser(userId: string) {
    const graphqlQuery = {
      query: `
        {
          getOneUser(userId: "${userId}"){
  	        email
            name
            imageUrl
            address
            arrears
          }
        }
      `
    };

    return this.http.post(this.graphQLUrl, graphqlQuery);
  }

  getAllUsers() {
    const graphqlQuery = {
      query: `
        {
          getAllUsers{
  	        email
            name
            imageUrl
            address
          }
        }
      `
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(res => {
      this.users = res["data"].getAllUsers;
      this.usersUpdated.next([...this.users]);
    });
  }

  getUserUpdateListener() {
    return this.usersUpdated.asObservable();
  }
}
