import { Injectable } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { Society } from "../society.model";
import { Apollo, gql } from "apollo-angular";

@Injectable({ providedIn: "root" })
export class DevService {
  private devStatusListenner = new Subject<boolean>();
  private societiesUpdated = new Subject<Society[]>();
  private societies: Society[];

  private listenNewSocietiesSub: Subscription;

  constructor(private apollo: Apollo) {}
  getAllSociety() {
    const graphqlQuery = gql`
      query {
        getAllSocieties {
          _id
          name
          email
          imageUrl
          address
          phoneNumber
          regNo
          approved
        }
      }
    `;

    this.apollo.query({ query: graphqlQuery }).subscribe(
      (res) => {
        this.societies = res["data"]["getAllSocieties"].map((society) => {
          return {
            ...society,
            isImageLoading: true,
            isActionLoading: false,
          };
        });
        console.log({ emitted: "getAllSociety", data: this.societies });
        this.devStatusListenner.next(false);
        this.societiesUpdated.next([...this.societies]);
      },
      (err) => {
        console.log(err);
        this.devStatusListenner.next(false);
      }
    );
  }

  approveSociety(societyId: string) {
    const graphqlQuery = gql`
      mutation {
        approveSociety(societyId: "${societyId}"){
          message
        }
      }
    `;

    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        console.log(res);
        let updatedSocieties = this.societies;
        updatedSocieties = updatedSocieties.map((society) => {
          if (society._id === societyId) {
            return { ...society, approved: true, isActionLoading: false };
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

  disApproveSociety(societyId: string) {
    const graphqlQuery = gql`
      mutation{
        disApproveSociety(societyId: "${societyId}"){
          message
        }
      }
    `;
    this.apollo.mutate({ mutation: graphqlQuery }).subscribe(
      (res) => {
        console.log(res);
        let updatedSocieties = this.societies;
        updatedSocieties = updatedSocieties.map((society) => {
          if (society._id === societyId) {
            return { ...society, approved: false, isActionLoading: false };
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

  listenNewSociety() {
    console.log({ emitted: "devService.listenNewSociety" });

    const graphqlQuery = gql`
      subscription listenNewSociety {
        listenNewSociety {
          society {
            _id
            name
            email
            imageUrl
            address
            phoneNumber
            regNo
            approved
          }
          type
        }
      }
    `;

    this.listenNewSocietiesSub = this.apollo
      .subscribe({
        query: graphqlQuery,
      })
      .subscribe((res) => {
        console.log({
          emitted: "devService.listenNewSociety",
          data: res,
        });

        if (res.data["listenNewSociety"].type === "POST") {
          const isSocietyExist = this.societies.some((society) => {
            return res.data["listenNewSociety"].society._id === society._id;
          });

          if (isSocietyExist) {
            return;
          }

          this.societies.push({
            ...res.data["listenNewSociety"].society,
          });
          this.societiesUpdated.next([...this.societies]);
        }
      });
  }

  unSubscribeListenNewSocieties() {
    if (this.listenNewSocietiesSub) {
      console.log({
        emitted: "devService.unSubscribeListenNewSocieties",
      });
      this.listenNewSocietiesSub.unsubscribe();
    }
  }

  getSocietiesUpdateListener() {
    return this.societiesUpdated;
  }

  getDevStatusListenner() {
    return this.devStatusListenner;
  }
}
