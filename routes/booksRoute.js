const express = require("express");
const {
  createBooks,
  getAllBooks,
  getSingleBooksById,
  updateBook,
  deleteBook,
} = require("../controllers/booksController");

const router = express.Router();

router.post("/create", createBooks);
router.get("/all", getAllBooks);
router.get("/:id", getSingleBooksById);
router.put("/update/:id", updateBook);
router.delete("/delete/:id", deleteBook);

module.exports = router;
