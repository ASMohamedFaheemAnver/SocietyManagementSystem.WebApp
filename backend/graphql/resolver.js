const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const User = require("../model/user");

const validator = require("validator");

module.exports = {
  createUser: async ({ userInput }) => {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "email is invalid!" });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "password is too short!" });
    }

    if (errors.length > 0) {
      const error = new Error("invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("user already exist!");
      error.code = 403;
      throw error;
    }

    const hash = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hash
    });
    const createdUser = await user.save();
    return createdUser._doc;
  },

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
