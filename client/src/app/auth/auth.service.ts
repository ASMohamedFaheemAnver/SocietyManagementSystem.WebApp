import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { Apollo, gql } from "apollo-angular";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private router: Router, private apollo: Apollo) {}

  private authStatusListenner = new Subject<boolean>();
  private userId: string;
  private token: string;
  private isUserLoggedIn: boolean;
  private tokenTimer: NodeJS.Timer;
  private userCategory: string;
  private imgToken: string;

  getAuthStatusListener() {
    return this.authStatusListenner;
  }

  getBasicSocietyDetailes() {
    const graphqlQuery = gql`
      query {
        getBasicSocietyDetailes {
          _id
          name
        }
      }
    `;
    return this.apollo.query({ query: graphqlQuery });
  }

  createMember(
    email: string,
    name: string,
    password: string,
    image: File,
    address: string,
    societyId: string,
    phoneNumber: string
  ) {
    const graphqlQuery = gql`
      mutation createMemberMutation($image: Upload!) {
        createMember(memberInput: {
                email: "${email}", 
                name: "${name}" 
                password: "${password}", 
                image: $image, 
                address: """${address}""", 
                societyId: "${societyId}", 
                phoneNumber: "${phoneNumber}"}){
                _id
                email
                name
            }
      }
    `;

    this.apollo
      .mutate({
        mutation: graphqlQuery,
        variables: { image: image },
        context: { useMultipart: true },
      })
      .subscribe(
        (res) => {
          this.router.navigateByUrl("/");
          this.authStatusListenner.next(false);
        },
        (err) => {
          console.log(err);
          this.authStatusListenner.next(false);
        }
      );
  }

  createSociety(
    email: string,
    name: string,
    password: string,
    image: File,
    address: string,
    regNo: string,
    phoneNumber: string
  ) {
    const graphqlQuery = gql`
      mutation createSocietyMutation($image: Upload!) {
        createSociety(societyInput: {
          email: "${email}",
          name: "${name}",
          password: "${password}",
          address: """${address}""",
          phoneNumber: "${phoneNumber}",
          image: $image
          regNo: "${regNo}"}){
          _id
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: graphqlQuery,
        variables: { image: image },
        context: { useMultipart: true },
      })
      .subscribe(
        (res) => {
          this.router.navigateByUrl("/");
          this.authStatusListenner.next(false);
        },
        (err) => {
          console.log(err);
          this.authStatusListenner.next(false);
        }
      );
  }

  loginUser(email: string, password: string, userCategory: string) {
    let graphqlQuery;
    this.userCategory = userCategory;
    if (userCategory === "member") {
      console.log({ emitted: "loginUser", in: "if (member)" });

      graphqlQuery = gql`
        query {
          loginMember(email: "${email}", password: "${password}"){
            _id
            token
            expiresIn
          }
        }
      `;
    } else if (userCategory === "society") {
      console.log({ emitted: "loginUser", in: "if (society)" });

      graphqlQuery = gql`
        query {
          loginSociety(email: "${email}", password: "${password}"){
            _id
            token
            expiresIn
          }
        }
      `;
    } else if (userCategory === "developer") {
      console.log({ emitted: "loginUser", in: "if (developer)" });

      graphqlQuery = gql`
        query {
          loginDeveloper(email: "${email}", password: "${password}"){
            _id
            token
            expiresIn
          }
        }
      `;
    }

    this.apollo.query({ query: graphqlQuery }).subscribe(
      (res) => {
        let token;

        if (userCategory === "member") {
          token = res["data"]["loginMember"].token;
        } else if (userCategory === "society") {
          token = res["data"]["loginSociety"].token;
        } else if (userCategory === "developer") {
          token = res["data"]["loginDeveloper"].token;
        }

        if (token) {
          let expiresIn;
          let userId;

          if (userCategory === "member") {
            expiresIn = res["data"]["loginMember"].expiresIn;
            userId = res["data"]["loginMember"]._id;
          } else if (userCategory === "society") {
            expiresIn = res["data"]["loginSociety"].expiresIn;
            userId = res["data"]["loginSociety"]._id;
          } else if (userCategory === "developer") {
            expiresIn = res["data"]["loginDeveloper"].expiresIn;
            userId = res["data"]["loginDeveloper"]._id;
          }
          this.token = token;
          this.authStatusListenner.next(true);
          this.userId = userId;
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn * 1000);
          this.isUserLoggedIn = true;
          this.saveAuthData(token, expirationDate, userId, userCategory);
          this.setAuthTimer(expiresIn);
          if (userCategory === "member") {
            this.router.navigateByUrl("/member/home");
          } else if (userCategory === "society") {
            this.router.navigateByUrl("/society/home");
          } else if (userCategory === "developer") {
            this.router.navigateByUrl("/developer/home");
          }
        }
      },
      (err) => {
        console.log(err);
        this.authStatusListenner.next(false);
      }
    );
  }

  private setAuthTimer(expiresIn: number) {
    this.tokenTimer = setTimeout(() => {
      this.logOutUser();
    }, expiresIn * 1000);
  }

  logOutUser() {
    this.token = null;
    this.isUserLoggedIn = false;
    this.authStatusListenner.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.userCategory = null;
    this.router.navigateByUrl("/");
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    userCategory: string
  ) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userCategory", userCategory);
    localStorage.setItem("expirationDate", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userCategory");
    localStorage.removeItem("expirationDate");
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (authInformation) {
      const now = new Date();
      const expiresIn =
        new Date(authInformation.expirationDate).getTime() - now.getTime();
      if (expiresIn > 0) {
        this.token = authInformation.token;
        this.userId = authInformation.userId;
        this.isUserLoggedIn = true;
        this.userCategory = authInformation.userCategory;
        this.setAuthTimer(expiresIn / 1000);
        this.authStatusListenner.next(true);
      }
    }
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userCategory = localStorage.getItem("userCategory");
    const expirationDate = localStorage.getItem("expirationDate");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      userId: userId,
      userCategory: userCategory,
      expirationDate: expirationDate,
    };
  }

  isUserAuth() {
    return this.isUserLoggedIn;
  }

  getToken() {
    return this.token;
  }

  getImgToken() {
    return this.imgToken;
  }

  getUserCategory() {
    return this.userCategory;
  }

  getUserId() {
    return this.userId;
  }
}
