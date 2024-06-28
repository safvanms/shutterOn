const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  functionName: String,
  functionDate: Date,
  place: String,
  provider: String,
  functionID: String,
  hostingTeam: String,
  phoneNumber: String,
  gallery: [String],
  paymentStatus: { type: Boolean, default: false },
  payment: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    date: Date,
  },
  eventPin: { type: String, default: "" },
});

const UserSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  phone: String,
  password: String,
  frozen: { type: Boolean, default: false },
  events: [EventSchema],
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
