import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}
  private graphQLUrl = "http://localhost:3000/graphql";

  private authStatusListenner = new Subject<boolean>();
  private userId: string;
  private token: string;
  private isUserLoggedIn: boolean;
  private tokenTimer: NodeJS.Timer;

  getAuthStatusListener() {
    return this.authStatusListenner;
  }

  createUser(email: string, name: string, password: string) {
    const graphqlQuery = {
      query: `
        mutation{
          createUser(userInput: {email: "${email}", name: "${name}" password: "${password}"}){
            _id
            email
            name
        }
      }`
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      res => {
        console.log(res);
        this.router.navigateByUrl("/");
      },
      err => {
        console.log(err);
        this.authStatusListenner.next(false);
      }
    );
  }

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
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      res => {
        console.log(res);
        const token = res["data"].login.token;
        if (token) {
          const expiresIn = res["data"].login.expiresIn;
          const userId = res["data"].login.userId;
          this.token = token;
          this.authStatusListenner.next(true);

          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresIn * 1000);
          this.isUserLoggedIn = true;
          this.saveAuthData(token, expirationDate, userId);
          this.setAuthTimer(expiresIn);
          this.router.navigateByUrl("/user/home");
        }
      },
      err => {
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

  private logOutUser() {
    this.token = null;
    this.isUserLoggedIn = false;
    this.authStatusListenner.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigateByUrl("/");
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("expirationDate", expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("expirationDate");
  }

  isUserAuth() {
    return this.isUserLoggedIn;
  }
}
