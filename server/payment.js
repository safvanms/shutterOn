const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const UserModel = require("../server/models/users.js");
require("dotenv").config();

const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

router.post("/pay", (req, res) => {
  const { amount } = req.body;

  try {
    const options = {
      amount: Number(amount * 100), // Convert to paise
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };
    razorpayInstance.orders.create(options, (err, order) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong!" });
      }
      res.status(200).json(order);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    newEvent,
  } = req.body;

  try {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const isAuthenticated = expectedSign === razorpay_signature;

    if (isAuthenticated) {
      const payment = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        date: new Date(),
      };

      // Save the event and payment details only if payment is successful
      const user = await UserModel.findOneAndUpdate(
        { userId },
        {
          $push: {
            events: {
              ...newEvent,
              paymentStatus: true,
              payment,
              eventPin: newEvent.eventPin || "",
            },
          },
        },
        { new: true }
      );

      if (user) {
        res.json({ message: "Payment Succeeded" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid Signature" });
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

module.exports = router;
