import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}
  private graphQLUrl = "http://localhost:3000/graphql";

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
}
