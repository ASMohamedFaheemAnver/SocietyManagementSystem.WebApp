const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const normalUser = require("../model/normal-user");

const superUser = require("../model/super-user");
const administrativeUser = require("../model/administrative-user");

const validator = require("validator");

module.exports = {
  createUser: async ({ userInput }) => {
    console.log(userInput);
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

    // if (!validator.isURL(userInput.imageUrl)) {
    //   errors.push({ message: "image url is not valid!" });
    // }

    if (errors.length > 0) {
      const error = new Error("invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    let existingUser;

    if (userInput.category === "normalUser") {
      existingUser = await normalUser.findOne({ email: userInput.email });
    } else if (userInput.category === "administrator") {
      existingUser = await administrativeUser.findOne({
        email: userInput.email
      });
    } else if (userInput.category === "superUser") {
      existingUser = await superUser.findOne({ email: userInput.email });
    } else {
      const error = new Error("can't create the category!");
      error.code = 409;
      throw error;
    }

    if (existingUser) {
      const error = new Error("user already exist!");
      error.code = 403;
      throw error;
    }

    const hash = await bcrypt.hash(userInput.password, 12);
    let user;
    if (userInput.category === "normalUser") {
      user = new normalUser({
        email: userInput.email,
        name: userInput.name,
        password: hash,
        imageUrl: userInput.imageUrl,
        address: userInput.address,
        arrears: 0
      });
    } else if (userInput.category === "administrator") {
      user = new administrativeUser({
        email: userInput.email,
        name: userInput.name,
        password: hash,
        imageUrl: userInput.imageUrl,
        address: userInput.address
      });
    } else if (userInput.category === "superUser") {
      user = new superUser({
        email: userInput.email,
        name: userInput.name,
        password: hash,
        imageUrl: userInput.imageUrl,
        address: userInput.address
      });
    }
    const createdUser = await user.save();
    return createdUser._doc;
  },

  login: async ({ email, password, category }) => {
    let user;
    console.log({ email: email, password: password, category: category });
    if (category === "normalUser") {
      user = await normalUser.findOne({ email: email });
    } else if (category === "administrator") {
      user = await administrativeUser.findOne({ email: email });
    } else if (category === "superUser") {
      user = await superUser.findOne({ email: email });
    }

    if (!user) {
      const error = new Error("user doesn't exist!");
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

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

    return { token: token, userId: user._id.toString(), expiresIn: 3600 };
  },

  getOneUser: async ({ userId }) => {
    const user = await normalUser.findById(userId);
    return user._doc;
  }
};
