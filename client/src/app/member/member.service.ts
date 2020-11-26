import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { Member } from "../member.model";
import { Log } from "../log.model";

@Injectable({ providedIn: "root" })
export class MemberService {
  constructor(private http: HttpClient) {}
  private graphQLUrl = environment.backEndGraphQlUrl2;
  private membersUpdated = new Subject<Member[]>();
  private members: Member[] = [];
  private logs: Log[] = [];
  private memberStatusListenner = new Subject<boolean>();
  private logsUpdatedListener = new Subject<{
    logs: Log[];
    logs_count: number;
  }>();

  private backeEndBaseUrl = environment.backeEndBaseUrl2;

  getMember() {
    const graphqlQuery = {
      query: `
        {
          getMember{
  	        email
            name
            imageUrl
            address
            arrears
          }
        }
      `,
    };

    return this.http.post(this.graphQLUrl, graphqlQuery);
  }

  getMemberUpdateListener() {
    return this.membersUpdated.asObservable();
  }

  getMemberLogsListenner() {
    return this.logsUpdatedListener;
  }

  getMemberStatusListenner() {
    return this.memberStatusListenner;
  }

  getAllSocietyMembers() {
    const graphqlQuery = {
      query: `{
        getAllSocietyMembers{
   	      _id
          name
          email
          imageUrl
          address
          arrears
          approved
        }
      }`,
    };
    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res) => {
        this.members = res["data"].getAllSocietyMembers.map((member) => {
          return {
            ...member,
            isImageLoading: true,
            imageUrl: this.backeEndBaseUrl + member["imageUrl"],
          };
        });
        this.membersUpdated.next([...this.members]);
        this.memberStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.memberStatusListenner.next(false);
      }
    );
  }

  getMemberLogs(page_number, page_size) {
    console.log(page_number);
    const graphqlQuery = {
      query: `{
        getMemberLogs(page_number: ${page_number}, page_size: ${page_size}){
          logs{
              _id
              kind
              fee{
                _id
                date
                amount
                description
              }
            }
          logs_count
          }
      }`,
    };

    this.http.post(this.graphQLUrl, graphqlQuery).subscribe(
      (res: Log[]) => {
        console.log(res);
        this.logs = res["data"].getMemberLogs.logs;
        const logs_count = res["data"].getMemberLogs.logs_count;
        this.logsUpdatedListener.next({
          logs: [...this.logs],
          logs_count: logs_count,
        });
        this.memberStatusListenner.next(false);
      },
      (err) => {
        console.log(err);
        this.memberStatusListenner.next(false);
      }
    );
  }
}
