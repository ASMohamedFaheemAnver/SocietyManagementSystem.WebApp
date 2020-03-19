const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const normalUserSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  arrears: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  fines: [{ type: Schema.Types.ObjectId, ref: "Fine" }],
  fees: [{ type: Schema.Types.ObjectId, ref: "Fee" }],
  logs: [{ type: Schema.Types.ObjectId, ref: "Log" }]
});

module.exports = mongoose.model("NormalUser", normalUserSchema);
