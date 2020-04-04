import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { Society } from "./society.model";

@Injectable({ providedIn: "root" })
export class DevService {
  private graphQLUrl = "http://localhost:3000/graphql";
  private devStatusListenner = new Subject<boolean>();
  private societiesUpdated = new Subject<Society[]>();
  private societies: Society[];

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
          approved
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe((res) => {
      this.societies = res["data"].getAllSocieties;
      console.log(this.societies);
      this.societiesUpdated.next([...this.societies]);
    });
  }

  approveSociety(societyId: string) {
    const graphqlQuery = {
      query: `
      mutation{
        approveSociety(societyId: "${societyId}"){
          message
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        let updatedSocieties = this.societies;
        updatedSocieties = updatedSocieties.map((society) => {
          if (society._id === societyId) {
            return { ...society, approved: true };
          }
          return society;
        });
        this.societiesUpdated.next([...updatedSocieties]);
        this.devStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.devStatusListenner.next(false);
      }
    );
  }

  disApproveSociety(societyId: string) {
    const graphqlQuery = {
      query: `
      mutation{
        disApproveSociety(societyId: "${societyId}"){
          message
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        let updatedSocieties = this.societies;
        updatedSocieties = updatedSocieties.map((society) => {
          if (society._id === societyId) {
            return { ...society, approved: false };
          }
          return society;
        });
        this.societies = updatedSocieties;
        this.societiesUpdated.next([...updatedSocieties]);
        this.devStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.devStatusListenner.next(false);
      }
    );
  }

  deleteSociety(societyId: string) {
    const graphqlQuery = {
      query: `
      mutation{
        deleteSociety(societyId: "${societyId}"){
          message
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        let updatedSocieties = this.societies;
        updatedSocieties = updatedSocieties.filter((society) => {
          return society._id !== societyId;
        });
        this.societies = updatedSocieties;
        this.societiesUpdated.next([...updatedSocieties]);
        this.devStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.devStatusListenner.next(false);
      }
    );
  }

  getSocietiesUpdateListener() {
    return this.societiesUpdated;
  }

  getDevStatusListenner() {
    return this.devStatusListenner;
  }
}
