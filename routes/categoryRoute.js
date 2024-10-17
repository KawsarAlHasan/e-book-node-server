const express = require("express");
const {
  createCategory,
  getCategory,
  updateCategory,
} = require("../controllers/CategoryController");

const router = express.Router();

router.post("/create", createCategory);
router.get("/", getCategory);
router.put("/update/:id", updateCategory);

module.exports = router;
