const express = require("express");
const verifyUser = require("../middleware/verifyUser");
const {
  createDeliveryAddress,
  getMyDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
} = require("../controllers/deliveryAddressController");

const router = express.Router();

router.post("/create", verifyUser, createDeliveryAddress);
router.get("/", verifyUser, getMyDeliveryAddress);
router.put("/update/:id", verifyUser, updateDeliveryAddress);
router.delete("/delete/:id", verifyUser, deleteDeliveryAddress);

module.exports = router;
