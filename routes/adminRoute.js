const express = require("express");

const {
  adminLogin,
  getMeAdmin,
  changeAdminPassword,
  updateAdmin,
} = require("../controllers/adminController");
const verifyAdmin = require("../middleware/verifyAdmin");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.get("/me", verifyAdmin, getMeAdmin);
router.post("/login", adminLogin);
router.put(
  "/update",
  uploadImage.single("profile_pic"),
  verifyAdmin,
  updateAdmin
);
router.put("/change-password", verifyAdmin, changeAdminPassword);

module.exports = router;
