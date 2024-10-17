const express = require("express");
const {
  createMainToc,
  getAllMainToc,
  getSingleMainToc,
  updateMainTOC,
  deleteMainTOC,
  getAllMainTocWithSubToc,
} = require("../controllers/mainTocController");

const router = express.Router();

router.post("/create", createMainToc);
router.get("/all/:id", getAllMainToc);
router.get("/w-sub/:id", getAllMainTocWithSubToc);
router.get("/:id", getSingleMainToc);
router.put("/update/:id", updateMainTOC);
router.delete("/delete/:id", deleteMainTOC);

module.exports = router;
