const express = require("express");

const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");
const { createOrder, getMyOrder } = require("../controllers/orderController");

const router = express.Router();

router.post("/create", verifyUser, createOrder);
router.get("/my", verifyUser, getMyOrder);

module.exports = router;
