const express = require("express");

const verifyUser = require("../middleware/verifyUser");
const {
  addFavoriteMarkText,
  checkFavoriteMarkText,
  removeMarkText,
  getAllFavoriteMarkText,
} = require("../controllers/favoriteMarkTextContrller");

const router = express.Router();

router.post("/create", verifyUser, addFavoriteMarkText);
router.get("/all", verifyUser, getAllFavoriteMarkText);
router.get("/check/:id", verifyUser, checkFavoriteMarkText);
router.delete("/delete/:id", verifyUser, removeMarkText);

module.exports = router;
