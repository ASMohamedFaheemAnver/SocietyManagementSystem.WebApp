const User = require("../model/user");

module.exports = {
  login: async ({ email, password }) => {
    return { token: "token", userId: "userId" };
  }
};
