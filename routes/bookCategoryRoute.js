const express = require("express");
const {
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/bookCategoryController");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.post("/create", uploadImage.single("image"), createCategory);
router.get("/", getCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;
