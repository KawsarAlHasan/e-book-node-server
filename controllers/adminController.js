const db = require("../config/db");
const bcrypt = require("bcrypt");
const { generateAdminToken } = require("../config/adminToken");

// admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }
    const [results] = await db.query(`SELECT * FROM admin WHERE email=?`, [
      email,
    ]);
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const token = generateAdminToken(admin);
    const { password: pwd, ...adminWithoutPassword } = admin;
    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        admin: adminWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Admin Login Unseccess",
      error: error.message,
    });
  }
};

// get me admin
exports.getMeAdmin = async (req, res) => {
  try {
    const admin = req.decodedAdmin;
    res.status(200).json(admin);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// admin password change
exports.changeAdminPassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(404).send({
        success: false,
        message: "Old Password and New Password is requied in body",
      });
    }
    const { id, password } = req.decodedAdmin;

    const isMatch = await bcrypt.compare(old_password, password);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Your Old Password is not correct",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const [result] = await db.query(`UPDATE admin SET password=? WHERE id =?`, [
      hashedPassword,
      id,
    ]);

    if (!result) {
      return res.status(403).json({
        success: false,
        error: "Something went wrong",
      });
    }

    res.status(200).send({
      success: true,
      message: "admin password updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in password Update admin",
      error: error.message,
    });
  }
};

// update Admin Info
exports.updateAdmin = async (req, res) => {
  try {
    const adminID = req.decodedAdmin.id;
    const adminName = req.decodedAdmin.name;
    const adminPhone = req.decodedAdmin.phone;
    const profilePic = req.decodedAdmin.profile_pic;

    const { name, phone } = req.body;

    const images = req.file;
    let profileImage = profilePic;
    if (images && images.path) {
      profileImage = `/public/images/${images.filename}`;
    }

    const [data] = await db.query(
      `UPDATE admin SET name=?, phone=?, profile_pic=? WHERE id =?`,
      [name || adminName, phone || adminPhone, profileImage, adminID]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update Admin ",
      });
    }
    res.status(200).send({
      success: true,
      message: "Admin updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update Admin ",
      error: error.message,
    });
  }
};
