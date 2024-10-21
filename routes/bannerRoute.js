const express = require("express");
const { createBanner } = require("../controllers/bannerController");

const router = express.Router();

router.post("/create", createBanner);
// router.get("/all", getAllpaymentMethod);
// router.get("/:id", getSinglePaymentMethodById);
// router.put("/update/:id", updatePaymentMethod);
// router.delete("/delete/:id", deletePaymentMethod);

module.exports = router;
