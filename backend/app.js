const express = require("express");
const ip = require("ip");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const app = express();
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolver");

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
  })
);

mongoose
  .connect(process.env.mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(_ => {
    app.listen(3000, () => {
      console.log("Server is running on " + ip.address() + ":3000");
    });
  })
  .catch(err => {
    console.log(err);
  });
