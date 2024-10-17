const express = require("express");
const {
  createMainToc,
  getAllMainToc,
  getSingleMainToc,
  updateMainTOC,
  deleteMainTOC,
} = require("../controllers/mainTocController");

const router = express.Router();

router.post("/create", createMainToc);
router.get("/all/:id", getAllMainToc);
router.get("/:id", getSingleMainToc);
router.put("/update/:id", updateMainTOC);
router.delete("/delete/:id", deleteMainTOC);

module.exports = router;
