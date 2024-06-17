const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  functionName: String,
  functionDate: Date,
  place: String,
  provider: String,
  functionID: String,
  hostingTeam: String,
  phoneNumber: String,
  gallery: [String], 
});

const userSchema = new mongoose.Schema({
  userId:String,
  name: String,
  phone: Number,
  email: String,
  password: String,
  events: [eventSchema],
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
