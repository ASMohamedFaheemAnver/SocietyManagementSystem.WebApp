import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class DevService {
  private graphQLUrl = "http://localhost:3000/graphql";

  constructor(private http: HttpClient) {}
  getAllSociety() {
    const graphqlQuery = {
      query: `{
        getAllSocieties{
   	      _id
          name
          email
          imageUrl
          address
          phoneNumber
          regNo
        }
      }`
    };
    return this.http.post(this.graphQLUrl, graphqlQuery);
  }
}
