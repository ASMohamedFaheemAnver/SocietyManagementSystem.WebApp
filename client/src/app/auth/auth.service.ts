import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}
  private graphQLUrl = environment.backEndGraphQlUrl2;
  private restImageUploadUrl = environment.backEndPicUploadUrl2;

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
    const graphqlQuery = {
      query: `{
        getBasicSocietyDetailes{
   	      _id
          name
        }
      }`,
    };
    return this.http.post(this.graphQLUrl, graphqlQuery);
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
    const formData = new FormData();
    formData.append("image", image);
    let imageUrl;
    this.http.post(this.restImageUploadUrl, formData).subscribe(
      (res) => {
        console.log(res);
        imageUrl = res["imageUrl"];
        this.imgToken = res["token"];
        const graphqlQuery = {
          query: `
            mutation{
              createMember(memberInput: {email: "${email}", name: "${name}" password: "${password}", 
              imageUrl: "${imageUrl}", address: """${address}""", societyId: "${societyId}", phoneNumber: "${phoneNumber}"}){
                _id
                email
                name
            }
          }`,
        };
        this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
          (res) => {
            console.log(res);
            this.router.navigateByUrl("/");
          },
          (err) => {
            console.log(err);
            const graphqlQuery = {
              query: `
                mutation{
                  deleteImage{
                    message
                  }
                }`,
            };
            this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
              (res) => {
                console.log(res);
              },
              (err) => {
                console.log(err);
              }
            );
            this.authStatusListenner.next(false);
          }
        );
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
    const formData = new FormData();
    formData.append("image", image);
    let imageUrl;
    this.http.post(this.restImageUploadUrl, formData).subscribe(
      (res) => {
        console.log(res);
        imageUrl = res["imageUrl"];
        this.imgToken = res["token"];
        const graphqlQuery = {
          query: `
            mutation{
              createSociety(societyInput: {email: "${email}", name: "${name}", password: "${password}", imageUrl: "${imageUrl}", address: """${address}""", phoneNumber: "${phoneNumber}", regNo: "${regNo}"}){
                _id
              }
            }   
          `,
        };
        this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
          (res) => {
            console.log(res);
            this.router.navigateByUrl("/");
          },
          (err) => {
            console.log(err);
            const graphqlQuery = {
              query: `
                mutation{
                  deleteImage{
                    message
                  }
                }`,
            };
            this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
              (res) => {
                console.log(res);
              },
              (err) => {
                console.log(err);
              }
            );
            this.authStatusListenner.next(false);
          }
        );
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
      graphqlQuery = {
        query: `{
        loginMember(email: "${email}", password: "${password}"){
          _id
          token
          expiresIn
        }
      }`,
      };
    } else if (userCategory === "society") {
      graphqlQuery = {
        query: `{
        loginSociety(email: "${email}", password: "${password}"){
          _id
          token
          expiresIn
        }
      }`,
      };
    } else if (userCategory === "developer") {
      graphqlQuery = {
        query: `{
        loginDeveloper(email: "${email}", password: "${password}"){
          _id
          token
          expiresIn
        }
      }`,
      };
    }
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        console.log(res);
        let token;

        if (userCategory === "member") {
          token = res["data"].loginMember.token;
        } else if (userCategory === "society") {
          token = res["data"].loginSociety.token;
        } else if (userCategory === "developer") {
          token = res["data"].loginDeveloper.token;
        }

        if (token) {
          let expiresIn;
          let userId;

          if (userCategory === "member") {
            expiresIn = res["data"].loginMember.expiresIn;
            userId = res["data"].loginMember._id;
          } else if (userCategory === "society") {
            expiresIn = res["data"].loginSociety.expiresIn;
            userId = res["data"].loginSociety._id;
          } else if (userCategory === "developer") {
            expiresIn = res["data"].loginDeveloper.expiresIn;
            userId = res["data"].loginDeveloper._id;
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
