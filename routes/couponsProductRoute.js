const express = require("express");
const { checkCoupon } = require("../controllers/couponsController");
const {
  createDiscountCoupons,
  getAllCouponsDiscount,
  getSingleCouponsDiscount,
  deleteCouponsDiscount,
  updateCouponsDiscount,
} = require("../controllers/couponsProductController");

const router = express.Router();

router.post("/create", createDiscountCoupons);
router.get("/", getAllCouponsDiscount);
router.get("/:id", getSingleCouponsDiscount);

router.put("/update/:id", updateCouponsDiscount);
router.put("/check", checkCoupon);

router.delete("/delete/:id", deleteCouponsDiscount);

module.exports = router;
