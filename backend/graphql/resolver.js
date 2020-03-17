const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const User = require("../model/user");

module.exports = {
  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("user doesn't exist!");
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(user.password, password);

    if (!isEqual) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.secret_word,
      { expiresIn: "1h" }
    );

    return { token: token, userId: user._id.toString() };
  }
};
