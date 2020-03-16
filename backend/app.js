const express = require("express");
const ip = require("ip");
const graphqlHttp = require("express-graphql");

const app = express();
const graphqlResolver = require("./graphql/resolver");
const graphqlSchema = require("./graphql/schema");

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
  })
);

app.listen(3000, () => {
  console.log("Server is running on " + ip.address() + ":3000");
});
