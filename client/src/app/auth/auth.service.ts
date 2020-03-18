import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}
  private graphQLUrl = "http://localhost:3000/graphql";
  private restImageUploadUrl = "http://localhost:3000/upload-profile";

  private authStatusListenner = new Subject<boolean>();
  private userId: string;
  private token: string;
  private isUserLoggedIn: boolean;
  private tokenTimer: NodeJS.Timer;

  getAuthStatusListener() {
    return this.authStatusListenner;
  }

  createUser(email: string, name: string, password: string, image: File) {
    const formData = new FormData();
    formData.append("image", image);
    this.http.post(this.restImageUploadUrl, formData).subscribe(
      res => {
        console.log(res);
        const imageUrl = res["imageUrl"];
        const graphqlQuery = {
          query: `
        mutation{
          createUser(userInput: {email: "${email}", name: "${name}" password: "${password}", imageUrl: "${imageUrl}"}){
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
          this.router.navigateByUrl("/user/home/" + userId);
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

  logOutUser() {
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
        this.setAuthTimer(expiresIn / 1000);
        this.authStatusListenner.next(true);
      }
    }
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const expirationDate = localStorage.getItem("expirationDate");
    if (!token || !expirationDate) {
      return;
    }
    return { token: token, userId: userId, expirationDate: expirationDate };
  }

  isUserAuth() {
    return this.isUserLoggedIn;
  }

  getUserId() {
    return this.userId;
  }
}
