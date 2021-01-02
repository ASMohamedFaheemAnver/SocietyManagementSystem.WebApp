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
import { SubscriptionClient } from "subscriptions-transport-ws";

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

  const error = onError(({ graphQLErrors, networkError, response }) => {
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
    if (networkError) {
      errorDialog.open(ErrorComponent, {
        data: networkError,
        disableClose: true,
      });
    }
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

  const client = new SubscriptionClient(wsUri, {
    reconnect: true,
    minTimeout: 60000,
  });

  client.use([
    {
      applyMiddleware(operationOptions, next) {
        operationOptions.variables["Authorization"] = localStorage.getItem(
          "token"
        );
        // console.log({ emitted: "applyMiddleware", data: operationOptions });
        next();
      },
    },
  ]);

  const ws = new WebSocketLink(client);

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
  // https://stackoverflow.com/questions/63123558/apollo-graphql-merge-cached-data
  const cache = new InMemoryCache({
    typePolicies: {
      Fee: {
        fields: {
          tracks: {
            merge(exsiting = [], incomming: any) {
              return [ ...incomming];
            },
          },
        },
      },
    },
  });

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
