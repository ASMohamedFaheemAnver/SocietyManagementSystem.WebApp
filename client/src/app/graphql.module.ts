import { NgModule } from "@angular/core";
import { APOLLO_OPTIONS } from "apollo-angular";
import {
  ApolloClientOptions,
  InMemoryCache,
  ApolloLink,
  split,
} from "@apollo/client/core";
import { HttpLink } from "apollo-angular/http";
import { environment } from "src/environments/environment";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { MatDialog } from "@angular/material/dialog";
import { ErrorComponent } from "./error/error.component";

const uri = environment.backEndGraphQlUrl2; // <-- add the URL of the GraphQL server here
const wsUri = environment.backEndWSUrl;
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
      errorDialog.open(ErrorComponent, { data: graphQLErrors });
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

  const ws = new WebSocketLink({
    uri: wsUri,
    options: {
      reconnect: true,
      connectionParams: () => {
        const token = localStorage.getItem("token");
        if (token) {
          return {
            Authorization: `Bearer ${token}`,
          };
        }
      },
    },
  });

  const http = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return (
        def.kind === "OperationDefinition" && def.operation === "subscription"
      );
    },
    ws,
    httpLink.create({ uri })
  );

  const link = ApolloLink.from([basic, auth, error, http]);
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
