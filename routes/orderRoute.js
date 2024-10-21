const express = require("express");

const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  createOrder,
  getMyOrder,
  getAllOrder,
  getSingleOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/create", verifyUser, createOrder);
router.get("/my", verifyUser, getMyOrder);
router.get("/all", getAllOrder);
router.get("/:id", getSingleOrder);
router.put("/status/:id", updateOrderStatus);

module.exports = router;
