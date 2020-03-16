const { buildSchema } = require("graphql");

module.exports = buildSchema(`

  type AuthData{
    token: String!
    userId: String!
  }

  type RootQuery{
    login(email: String!, password: String!): AuthData!
  }

  schema{
    query: RootQuery
  }
`);
