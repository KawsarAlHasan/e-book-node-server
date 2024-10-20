const express = require("express");

const verifyUser = require("../middleware/verifyUser");
const {
  addRating,
  myRating,
  updateRating,
} = require("../controllers/ratingController");

const router = express.Router();

router.post("/add", verifyUser, addRating);
router.get("/my", verifyUser, myRating);
router.put("/update/:id", verifyUser, updateRating);

module.exports = router;
