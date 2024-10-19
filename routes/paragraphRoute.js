const express = require("express");
const {
  createParagraph,
  getSingleParagraph,
  updateParagraph,
  deleteParagraph,
} = require("../controllers/paragraphController");

const router = express.Router();

router.post("/create", createParagraph);
router.get("/:id", getSingleParagraph);
router.put("/update/:id", updateParagraph);
router.delete("/delete/:id", deleteParagraph);

module.exports = router;
