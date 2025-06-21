const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { settlePayment,getPaymentsByGroup } = require("../controllers/paymentController");

router.post("/settle", verifyToken, settlePayment);
router.get("/:groupId", verifyToken, getPaymentsByGroup);

module.exports = router;
