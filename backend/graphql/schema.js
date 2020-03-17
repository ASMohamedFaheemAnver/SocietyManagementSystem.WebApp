const { buildSchema } = require("graphql");

module.exports = buildSchema(`

  input UserInputData{
    email: String!
    name: String!
    password: String!
  }

  type User{
    _id: ID!
    name: String!
    email: String!
  }

  type AuthData{
    token: String!
    userId: String!
    expiresIn: Int!
  }

  type RootQuery{
    login(email: String!, password: String!): AuthData!
  }

  type RootMutation{
    createUser(userInput: UserInputData!): User!
  }

  schema{
    query: RootQuery
    mutation: RootMutation
  }
`);
