const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const Member = require("../model/member");

const Society = require("../model/society");
const Log = require("../model/log");

const Developer = require("../model/developer");

const validator = require("validator");

const fileDeletor = require("../util/delete-file");

const MonthFee = require("../model/month-fee");
const ExtraFee = require("../model/extra-fee");

module.exports = {
  getBasicSocietyDetailes: async () => {
    const societies = await Society.find();
    return societies;
  },
  createSociety: async ({ societyInput }) => {
    let existingSociety = await Society.findOne({ email: societyInput.email });

    if (existingSociety) {
      const error = new Error("society already exist!");
      error.code = 403;
      throw error;
    }

    const hash = await bcrypt.hash(societyInput.password, 12);

    const society = new Society({
      email: societyInput.email,
      name: societyInput.name,
      imageUrl: societyInput.imageUrl,
      address: societyInput.address,
      password: hash,
      phoneNumber: societyInput.phoneNumber,
      regNo: societyInput.regNo,
    });

    const createdSociety = await society.save();
    return createdSociety._doc;
  },

  createMember: async ({ memberInput }) => {
    console.log(memberInput);
    const errors = [];
    if (!validator.isEmail(memberInput.email)) {
      errors.push({ message: "email is invalid!" });
    }
    if (
      validator.isEmpty(memberInput.password) ||
      !validator.isLength(memberInput.password, { min: 5 })
    ) {
      errors.push({ message: "password is too short!" });
    }

    // if (!validator.isURL(memberInput.imageUrl)) {
    //   errors.push({ message: "image url is not valid!" });
    // }

    if (errors.length > 0) {
      const error = new Error("invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    let existingSociety = await Society.findById(memberInput.societyId);

    if (!existingSociety) {
      const error = new Error("society not exist!");
      error.code = 403;
      throw error;
    }

    let existingMember = await Member.findOne({
      email: memberInput.email,
    });

    if (existingMember) {
      const error = new Error("member already exist!");
      error.code = 403;
      throw error;
    }

    const hash = await bcrypt.hash(memberInput.password, 12);
    let member = new Member({
      email: memberInput.email,
      name: memberInput.name,
      password: hash,
      imageUrl: memberInput.imageUrl,
      address: memberInput.address,
      arrears: 0,
      society: existingSociety,
      phoneNumber: memberInput.phoneNumber,
    });
    const createdMember = await member.save();
    existingSociety.members.push(createdMember);
    await existingSociety.save();
    return createdMember._doc;
  },

  approveSociety: async ({ societyId }, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "developer") {
      const error = new Error("only developer can approve societies!");
      error.code = 401;
      throw error;
    }

    if (!societyId) {
      const error = new Error("invalid society id!");
      error.code = 403;
      throw error;
    }
    await Society.updateOne({ _id: societyId }, { $set: { approved: true } });
    return { message: "approved successfly!" };
  },

  approveMember: async ({ memberId }, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "society") {
      const error = new Error("only society can approve it's member!");
      error.code = 401;
      throw error;
    }

    if (!memberId) {
      const error = new Error("invalid society id!");
      error.code = 403;
      throw error;
    }
    await Member.updateOne(
      { _id: memberId, society: req.decryptedId },
      { $set: { approved: true } }
    );
    return { message: "approved successfly!" };
  },
  disApproveMember: async ({ memberId }, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "society") {
      const error = new Error("only society can disapprove it's member!");
      error.code = 401;
      throw error;
    }

    if (!memberId) {
      const error = new Error("invalid society id!");
      error.code = 403;
      throw error;
    }
    await Member.updateOne(
      { _id: memberId, society: req.decryptedId },
      { $set: { approved: false } }
    );
    return { message: "disapproved successfly!" };
  },

  disApproveSociety: async ({ societyId }, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "developer") {
      const error = new Error("only developer can approve societies!");
      error.code = 401;
      throw error;
    }

    if (!societyId) {
      const error = new Error("invalid society id!");
      error.code = 403;
      throw error;
    }
    await Society.updateOne({ _id: societyId }, { $set: { approved: false } });
    return { message: "disapproved successfly!" };
  },

  loginMember: async ({ email, password }) => {
    console.log({ email: email, password: password });
    let member = await Member.findOne({ email: email });

    if (!member) {
      const error = new Error("member doesn't exist!");
      error.code = 401;
      throw error;
    }
    // console.log(member.approved);
    if (!member.approved) {
      const error = new Error("member doesn't approved yet!");
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, member.password);

    if (!isEqual) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      { encryptedId: member._id.toString(), category: "member" },
      process.env.secret_word,
      { expiresIn: "10h" }
    );
    return { token: token, _id: member._id.toString(), expiresIn: 36000 };
  },

  loginSociety: async ({ email, password }) => {
    console.log({ email: email, password: password });
    let society = await Society.findOne({ email: email });
    if (!society) {
      const error = new Error("society doesn't exist!");
      error.code = 401;
      throw error;
    }

    if (!society.approved) {
      const error = new Error("society doesn't approved yet!");
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, society.password);

    if (!isEqual) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      { encryptedId: society._id.toString(), category: "society" },
      process.env.secret_word,
      { expiresIn: "10h" }
    );

    return { token: token, _id: society._id.toString(), expiresIn: 36000 };
  },

  loginDeveloper: async ({ email, password }) => {
    console.log({ email: email, password: password });
    let developer = await Developer.findOne({ email: email });
    if (!developer) {
      const error = new Error("developer doesn't exist!");
      error.code = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, developer.password);

    if (!isEqual) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      { encryptedId: developer._id.toString(), category: "developer" },
      process.env.secret_word,
      { expiresIn: "10h" }
    );

    return {
      token: token,
      _id: developer._id.toString(),
      expiresIn: 36000,
    };
  },

  getMember: async ({}, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "member") {
      const error = new Error("only developer can approve societies!");
      error.code = 401;
      throw error;
    }

    const member = await Member.findById(req.decryptedId);
    return member._doc;
  },
  getAllMembers: async ({}, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }
    if (req.category !== "society") {
      const error = new Error("only society can view it's members!");
      error.code = 401;
      throw error;
    }
    const society = await Society.findById(req.decryptedId).populate("members");
    return society.members;
  },
  getAllSocieties: async ({}, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }
    if (req.category !== "developer") {
      const error = new Error("only developer can approve societies!");
      error.code = 401;
      throw error;
    }
    const societies = await Society.find();
    return societies;
  },

  deleteSociety: async ({ societyId }, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }
    if (req.category !== "developer") {
      const error = new Error("only developer can delete societies!");
      error.code = 401;
      throw error;
    }
    const society = await Society.findById(societyId).populate("members");

    society.members.forEach(async (memberId) => {
      const member = await Member.findById(memberId);
      fileDeletor(member.imageUrl);
      member.delete();
    });

    fileDeletor(society.imageUrl);
    await society.delete();
    return { message: "society deleted!" };
  },

  getSociety: async ({}, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }
    if (req.category !== "society") {
      const error = new Error("only developer can delete societies!");
      error.code = 401;
      throw error;
    }
    const society = await Society.findById(req.decryptedId);
    return society;
  },
  deleteMember: async ({ memberId }, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }
    if (req.category !== "society") {
      const error = new Error("only developer can delete societies!");
      error.code = 401;
      throw error;
    }
    const member = await Member.findById(memberId).populate("society");
    member.society.members.pop(memberId);
    await member.society.save();
    fileDeletor(member.imageUrl);
    await member.delete();
    return { message: "member deleted!" };
  },

  deleteImage({}, req) {
    if (!req.isImg) {
      const error = new Error("not allowed to delete this image!");
      error.code = 401;
      throw error;
    }

    fileDeletor(req.imageUrl);
    return { message: "image deleted!" };
  },

  getAllSocietyMembers: async ({}, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }
    if (req.category !== "member") {
      const error = new Error("you are not a member!");
      error.code = 401;
      throw error;
    }

    const member = await Member.findById(req.decryptedId).populate("society");
    const members = [];
    for (let i = 0; i < member.society.members.length; i++) {
      members.push(await Member.findById(member.society.members[i]));
    }
    return members;
  },

  addFeeToMember: async ({ memberId, fee }, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "society") {
      const error = new Error("only society can add fee to it's members!");
      error.code = 401;
      throw error;
    }

    const member = await Member.findById(memberId);
    if (member.society !== req.decryptedId) {
      const error = new Error(
        "you can't modify other society member's details"
      );
      error.code = 401;
      throw error;
    }
    member.arrears = member.arrears + fee;
    await member.save();
    return { message: "Fee added!" };
  },

  addMonthlyFeeToEveryone: async ({ monthlyFee, description }, req) => {
    console.log(monthlyFee, description);
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "society") {
      const error = new Error("only society can add fee to it's members!");
      error.code = 401;
      throw error;
    }

    const society = await Society.findById(req.decryptedId).populate("members");
    // console.log(society);
    // console.log(society.members);
    const monthFee = new MonthFee({
      amount: monthlyFee,
      date: new Date(),
      description: description,
    });
    await monthFee.save();
    society.month_fees.push(monthFee);

    const log = new Log({ kind: "MonthFee", item: monthFee });
    await log.save();

    for (let i = 0; i < society.members.length; i++) {
      const member = await Member.findById(society.members[i]);
      member.arrears += monthlyFee;
      society.expected_income += monthlyFee;
      member.month_fees.push(monthFee);
      member.logs.push(log);
      await member.save();
    }
    society.logs.push(log);
    await society.save();

    // const updatedSociety = await Society.findById(req.decryptedId);
    // console.log(updatedSociety.logs);

    return { message: "month fee added to all members!" };
  },
  addExtraFeeToEveryone: async ({ extraFee, description }, req) => {
    console.log(extraFee, description);
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "society") {
      const error = new Error("only society can add fee to it's members!");
      error.code = 401;
      throw error;
    }

    const society = await Society.findById(req.decryptedId).populate("members");
    // console.log(society);
    // console.log(society.members);
    const extraFeeObj = new ExtraFee({
      amount: extraFee,
      date: new Date(),
      description: description,
    });
    await extraFeeObj.save();
    society.extra_fees.push(extraFeeObj);

    const log = new Log({ kind: "ExtraFee", item: extraFeeObj });
    await log.save();

    for (let i = 0; i < society.members.length; i++) {
      const member = await Member.findById(society.members[i]);
      member.arrears += extraFee;
      society.expected_income += extraFee;
      member.extra_fees.push(extraFeeObj);
      member.logs.push(log);
      await member.save();
    }

    society.logs.push(log);

    await society.save();

    // const updatedSociety = await Society.findById(req.decryptedId).populate(
    //   "logs.item"
    // );
    // console.log(updatedSociety.logs);

    return { message: "extra fee added to all members!" };
  },

  getSocietyLogs: async ({ page_number }, req) => {
    if (!req.isAuth) {
      const error = new Error("not authenticated!");
      error.code = 401;
      throw error;
    }

    if (req.category !== "society") {
      const error = new Error("only society can add fee to it's members!");
      error.code = 401;
      throw error;
    }

    const society = await Society.findById(req.decryptedId).populate([
      {
        path: "logs",
        options: { skip: page_number * 5, limit: 5 },
        populate: {
          path: "item",
        },
      },
    ]);

    // console.log(society.logs);

    society.logs.map((log) => {
      if (log.kind === "MonthFee" || log.kind === "ExtraFee") {
        log.fee = log.item;
      }

      return log;
    });

    return society.logs;
  },
};
