const express = require("express");
const {
  createSubToc,
  getAllSubToc,
  getSingleSubToc,
  updateSubTOC,
  deleteSubTOC,
} = require("../controllers/subTocController");

const router = express.Router();

router.post("/create", createSubToc);
router.get("/all", getAllSubToc);
router.get("/:id", getSingleSubToc);
router.put("/update/:id", updateSubTOC);
router.delete("/delete/:id", deleteSubTOC);

module.exports = router;
