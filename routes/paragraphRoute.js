const express = require("express");
const {
  createParagraph,
  getSingleParagraph,
  updateParagraph,
  deleteParagraph,
  addMarkText,
  updateMarkText,
  deleteMarkText,
  getMarkText,
} = require("../controllers/paragraphController");

const router = express.Router();

router.post("/create", createParagraph);
router.get("/:id", getSingleParagraph);
router.put("/update/:id", updateParagraph);
router.delete("/delete/:id", deleteParagraph);

router.post("/marktext/add", addMarkText);
router.put("/marktext/update/:id", updateMarkText);
router.delete("/marktext/delete/:id", deleteMarkText);
router.get("/marktext/:id", getMarkText);

module.exports = router;
