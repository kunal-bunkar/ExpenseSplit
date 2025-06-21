const Payment = require("../models/Payment");
const Group = require("../models/Group");
const mongoose = require("mongoose");

exports.settlePayment = async (req, res) => {
  const { groupId, from, to, amount } = req.body;
  if (!groupId || !from || !to || !amount) {
  return res.status(400).json({ message: "Missing required fields" });
}

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const payment = new Payment({ group: groupId, from, to, amount });
    await payment.save();

    res.status(201).json({ message: "Payment recorded", payment });
  } catch (err) {
    console.error("Error recording payment:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.getPaymentsByGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const payments = await Payment.find({ group: groupId })
      .populate("from", "name")
      .populate("to", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
