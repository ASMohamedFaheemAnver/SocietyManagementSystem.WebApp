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

  type MonthlyFee{
    description: String!
    amount: Int!
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
    month_fee: MonthlyFee!
    expected_income: Int!
    current_income: Int!
  }

  type BasicSocietyData{
    _id: ID!
    name: String!
  }

    type Fee{
    _id: ID!
    amount: Int!
    date: String!
    description: String!
  }

  type SocietyLog{
    _id: ID!
    kind: String!
    fee: Fee
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
    getMember: Member!
    getAllSocietyMembers: [Member!]!
    getBasicSocietyDetailes: [BasicSocietyData!]!
    getAllSocieties: [Society!]!
    getSociety: Society!
    getAllMembers: [Member!]!
    addFeeToMember(memberId: String!, fee: Int!): Message!
    getSocietyLogs(page_number: Int!): [SocietyLog!]!
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
    deleteImage: Message!
    addMonthlyFeeToEveryone(monthlyFee: Int!, description: String!): Message!
    addExtraFeeToEveryone(extraFee: Int!, description: String!): Message!
  }

  schema{
    query: RootQuery
    mutation: RootMutation
  }
`);
