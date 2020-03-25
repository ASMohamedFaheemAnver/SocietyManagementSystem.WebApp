const express = require("express");
const ip = require("ip");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const fs = require("fs");
const path = require("path");

const auth = require("./middleware/auth");

const Developer = require("./model/developer");

const extractFile = require("./middleware/file");

const app = express();
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolver");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.use("/images", express.static(path.join("images")));

app.post("/upload-profile", extractFile, (req, res, next) => {
  if (!req.file) {
    return res.status(404).json({ message: "no file provided!" });
  }
  const url = req.protocol + "://" + req.get("host");

  const imageUrl = url + "/" + req.file.path;

  return res
    .status(201)
    .json({ message: "image uploaded!", imageUrl: imageUrl });
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

let PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(_ => {
    const dir = path.join(__dirname, "images");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    Developer.find().then(isSuper => {
      if (isSuper == 0) {
        const developer = new Developer({
          email: "jstrfaheem065@gmail.com",
          password:
            "$2b$12$4ffLoL5xlDNxz.WhmI6cbeld4415PhxwFaNzRY1SLYlkay/Tipy7u"
        });
        developer.save();
      }
    });

    app.listen(PORT, () => {
      console.log("Server is running on " + ip.address() + ":3000");
    });
  })
  .catch(err => {
    console.log(err);
  });
