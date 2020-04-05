const { buildSchema } = require("graphql");

module.exports = buildSchema(`

  type Message{
    message: String!
  }

  input MemberInputData{
    email: String!
    name: String!
    password: String!
    imageUrl: String!
    address: String!
    societyId: String!
    phoneNumber: String!
  }

  input SocietyInputData{
    email: String!
    name: String!
    password: String!
    imageUrl: String!
    address: String!
    phoneNumber: String!
    regNo: String!
  }

  type Member{
    _id: ID!
    name: String!
    email: String!
    imageUrl: String!
    address: String!
    arrears: Int!
    approved: Boolean!
  }

  type Society{
    _id: ID!
    name: String!
    email: String!
    imageUrl: String!
    address: String!
    phoneNumber: String!
    regNo: String!
    approved: Boolean!
  }

  type BasicSocietyData{
    _id: ID!
    name: String!
  }

  type AuthData{
    token: String!
    _id: String!
    expiresIn: Int!
  }

  type RootQuery{
    loginMember(email: String!, password: String!): AuthData!
    loginSociety(email: String!, password: String!): AuthData!
    loginDeveloper(email: String!, password: String!): AuthData!
    getOneMember(memberId: String!): Member!
    getAllSocietyMembers(societyId: String!): [Member!]!
    getBasicSocietyDetailes: [BasicSocietyData!]!
    getAllSocieties: [Society!]!
    getOneSociety(societyId: String!): Society!
  }

  type RootMutation{
    createSociety(societyInput: SocietyInputData!): Society!
    createMember(memberInput: MemberInputData!): Member!
    approveSociety(societyId: String!): Message!
    approveMember(memberId: String!): Message!
    disApproveSociety(societyId: String!): Message!
    deleteSociety(societyId: String!): Message!
    disApproveMember(memberId: String!): Message!
    deleteMember(memberId: String!): Message!
  }

  schema{
    query: RootQuery
    mutation: RootMutation
  }
`);
