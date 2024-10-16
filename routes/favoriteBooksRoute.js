const express = require("express");
const {
  addFavorite,
  getAllFavoriteBooks,
  deleteAllBooksFromFavorite,
  deleteSingleBookFromFavorite,
  checkFavorite,
} = require("../controllers/favoriteBooksController");
const verifyUser = require("../middleware/verifyUser");

const router = express.Router();

router.post("/create", verifyUser, addFavorite);
router.get("/all", verifyUser, getAllFavoriteBooks);
router.get("/check/:id", verifyUser, checkFavorite);
router.delete("/delete/bulk", verifyUser, deleteAllBooksFromFavorite);
router.delete("/delete/:id", verifyUser, deleteSingleBookFromFavorite);

module.exports = router;
