import { NgModule } from "@angular/core";
import { APOLLO_OPTIONS } from "apollo-angular";
import {
  ApolloClientOptions,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client/core";
import { HttpLink } from "apollo-angular/http";
import { environment } from "src/environments/environment";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { MatDialog } from "@angular/material/dialog";
import { ErrorComponent } from "./error/error.component";

const uri = environment.backEndGraphQlUrl2; // <-- add the URL of the GraphQL server here
export function createApollo(
  httpLink: HttpLink,
  errorDialog: MatDialog
): ApolloClientOptions<any> {
  const basic = setContext((operation, context) => ({
    headers: {
      Accept: "charset=utf-8",
    },
  }));

  const error = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(
            locations
          )}, Path: ${path}`
        )
      );

      errorDialog.open(ErrorComponent, {
        data: graphQLErrors,
        disableClose: true,
      });
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const auth = setContext((operation, context) => {
    const token = localStorage.getItem("token");
    if (token === null) {
      return {};
    } else {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
  });

  const link = ApolloLink.from([basic, auth, error, httpLink.create({ uri })]);
  const cache = new InMemoryCache();

  return {
    link,
    cache,
    defaultOptions: {
      watchQuery: {
        errorPolicy: "all",
      },
    },
  };
}

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink, MatDialog],
    },
  ],
})
export class GraphQLModule {}
