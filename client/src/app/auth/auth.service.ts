import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private http: HttpClient) {}
  graphQLUrl = "http://localhost:3000/graphql";

  loginUser(email: string, password: string) {
    const graphqlQuery = {
      query: `{
        login(email: "${email}", password: "${password}"){
          userId
          token
          expiresIn
        }
      }`
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(res => {
      console.log(res);
    });
  }
}
