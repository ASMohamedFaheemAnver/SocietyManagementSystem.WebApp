const express = require("express");
const ip = require("ip");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const app = express();
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolver");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }

      const data = err.originalError.data;
      const message = err.message;
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    }
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
