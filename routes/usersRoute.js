const express = require("express");

const verifyUser = require("../middleware/verifyUser");
const {
  getAllUsers,
  userSignup,
  userLogin,
  getMeUser,
  updateUserPassword,
  getSingleUser,
  updateUser,
  updateStatus,
  deleteUser,
} = require("../controllers/usersController");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.get("/all", getAllUsers); //all users for admin
router.get("/me", verifyUser, getMeUser);
router.post("/signup", userSignup);
router.post("/login", userLogin);
router.put(
  "/update",
  uploadImage.single("profile_pic"),
  verifyUser,
  updateUser
);
router.put("/update-password", verifyUser, updateUserPassword);
router.put("/update-status/:id", updateStatus);
router.get("/:id", getSingleUser);

router.delete("/delete/:id", deleteUser);

module.exports = router;
