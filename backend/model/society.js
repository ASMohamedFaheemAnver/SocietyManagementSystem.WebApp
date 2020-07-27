const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const societySchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  regNo: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false,
  },

  month_fee: {
    type: { description: String, amount: Number },
    default: { description: "Monthly fees.", amount: 0 },
  },
  members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  fines: [{ type: Schema.Types.ObjectId, ref: "Fine" }],
  extra_fees: [{ type: Schema.Types.ObjectId, ref: "ExtraFee" }],
  month_fees: [{ type: Schema.Types.ObjectId, ref: "MonthFee" }],
  logs: [{ type: Schema.Types.ObjectId, ref: "Log" }],
});

module.exports = mongoose.model("Society", societySchema);
