const express = require("express");
const {
  createBanner,
  getAllBanner,
  getSinglebannerById,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");

const router = express.Router();

router.post("/create", createBanner);
router.get("/all", getAllBanner);
router.get("/:id", getSinglebannerById);
router.put("/update/:id", updateBanner);
router.delete("/delete/:id", deleteBanner);

module.exports = router;
