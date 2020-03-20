const { buildSchema } = require("graphql");

module.exports = buildSchema(`

  input UserInputData{
    email: String!
    name: String!
    password: String!
    imageUrl: String!
    address: String!
    category: String!
  }

  type User{
    _id: ID!
    name: String!
    email: String!
    imageUrl: String!
    address: String!
    arrears: Int!
  }

  type AuthData{
    token: String!
    userId: String!
    expiresIn: Int!
  }

  type RootQuery{
    login(email: String!, password: String!, category: String!): AuthData!
    getOneUser(userId: String!): User!
    getAllUsers: [User!]!
  }

  type RootMutation{
    createUser(userInput: UserInputData!): User!
  }

  schema{
    query: RootQuery
    mutation: RootMutation
  }
`);
