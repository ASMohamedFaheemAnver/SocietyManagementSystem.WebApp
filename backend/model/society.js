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
  members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
});

module.exports = mongoose.model("Society", societySchema);
