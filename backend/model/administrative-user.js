const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const administrativeUserSchema = new Schema({
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
  address: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("AdministrativeUser", administrativeUserSchema);
