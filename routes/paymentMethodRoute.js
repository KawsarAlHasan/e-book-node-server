const express = require("express");

const {
  createPaymentMethod,
  getAllpaymentMethod,
  getSinglePaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
} = require("../controllers/paymentMethodController");

const router = express.Router();

router.post("/create", createPaymentMethod);
router.get("/all", getAllpaymentMethod);
router.get("/:id", getSinglePaymentMethodById);
router.put("/update/:id", updatePaymentMethod);
router.delete("/delete/:id", deletePaymentMethod);

module.exports = router;
