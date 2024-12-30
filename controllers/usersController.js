const db = require("../config/db");
const bcrypt = require("bcrypt");
const { generateUserToken } = require("../config/userToken");

// get all Users
exports.getAllUsers = async (req, res) => {
  try {
    let { page, limit, name, email, id } = req.query;

    // Default pagination values
    page = parseInt(page) || 1; // Default page is 1
    limit = parseInt(limit) || 20; // Default limit is 20
    const offset = (page - 1) * limit; // Calculate offset for pagination

    // Initialize SQL query and parameters array
    let sqlQuery = "SELECT * FROM users WHERE 1=1"; // 1=1 makes appending conditions easier
    const queryParams = [];

    // Add filters for name, email, and id if provided
    if (name) {
      sqlQuery += " AND name LIKE ?";
      queryParams.push(`%${name}%`); // Using LIKE for partial match
    }

    if (email) {
      sqlQuery += " AND email LIKE ?";
      queryParams.push(`%${email}%`);
    }

    if (id) {
      sqlQuery += " AND id = ?";
      queryParams.push(id);
    }

    // Add pagination to the query
    sqlQuery += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Execute the query with filters and pagination
    const [data] = await db.query(sqlQuery, queryParams);

    if (!data || data.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    // Get total count of users for pagination info (with the same filters)
    let countQuery = "SELECT COUNT(*) as count FROM users WHERE 1=1";
    const countParams = [];

    // Add the same filters for total count query
    if (name) {
      countQuery += " AND name LIKE ?";
      countParams.push(`%${name}%`);
    }

    if (email) {
      countQuery += " AND email LIKE ?";
      countParams.push(`%${email}%`);
    }

    if (id) {
      countQuery += " AND id = ?";
      countParams.push(id);
    }

    const [totalUsersCount] = await db.query(countQuery, countParams);
    const totalUsers = totalUsersCount[0].count;

    // Send response with users data and pagination info
    res.status(200).send({
      success: true,
      message: "All Users",
      totalUsers: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      data: data,
    });
  } catch (error) {
    // Error handling
    res.status(500).send({
      success: false,
      message: "Error in Get All Users",
      error: error.message,
    });
  }
};

// get single user by id
exports.getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(404).send({
        success: false,
        message: "User ID is required in params",
      });
    }

    const [data] = await db.query(`SELECT * FROM users WHERE id=? `, [userId]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No user found",
      });
    }
    res.status(200).send(data[0]);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting user",
      error: error.message,
    });
  }
};

// signup user
exports.userSignup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check input fields
    if (!name || !email || !password || !phone) {
      return res.status(400).send({
        success: false,
        message: "Please provide name, email, password & phone",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password length check
    if (password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password should be at least 6 characters long",
      });
    }

    // Hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email already exists
    const [existingUser] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);

    if (existingUser.length > 0) {
      return res.status(400).send({
        success: false,
        message: "Email already registered",
      });
    }

    // Insert the user
    const [data] = await db.query(
      `INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, phone]
    );

    if (!data || !data.insertId) {
      return res.status(500).send({
        success: false,
        message: "Error in creating user",
      });
    }

    // Fetch and return the new user's information
    const [results] = await db.query(`SELECT * FROM users WHERE id=?`, [
      data.insertId,
    ]);
    const user = results[0];

    // Generate JWT token
    const token = generateUserToken(user);

    // Return success message along with the user data
    res.status(200).send({
      success: true,
      message: "User created successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // Handle server error
    res.status(500).send({
      success: false,
      message: "Error in Create User API",
      error: error.message,
    });
  }
};

// firebase user login or signup
exports.userFirebaseSignup = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Check if email already exists
    const [existingUser] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);

    let user = [];
    let loginOrSignup = "";
    if (existingUser.length > 0) {
      user = existingUser[0];
      loginOrSignup = "Login";
    } else {
      // Insert the user
      const [data] = await db.query(
        `INSERT INTO users (name, email, phone) VALUES (?, ?, ?)`,
        [name, email, phone]
      );

      // Fetch and return the new user's information
      const [results] = await db.query(`SELECT * FROM users WHERE id=?`, [
        data.insertId,
      ]);
      user = results[0];
      loginOrSignup = "Signup";
    }

    // Generate JWT token
    const token = generateUserToken(user);

    // Return success message along with the user data
    res.status(200).send({
      success: true,
      message: `User ${loginOrSignup} successfully`,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // Handle server error
    res.status(500).send({
      success: false,
      message: `Error in ${loginOrSignup} User API`,
      error: error.message,
    });
  }
};

// user login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }
    const [results] = await db.query(`SELECT * FROM users WHERE email=?`, [
      email,
    ]);
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const users = results[0];
    const isMatch = await bcrypt.compare(password, users.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const token = generateUserToken(users);
    const { password: pwd, ...usersWithoutPassword } = users;
    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: usersWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "User Login Unseccess",
      error: error.message,
    });
  }
};

// get me User
exports.getMeUser = async (req, res) => {
  try {
    const decodeduser = req.decodedUser;
    res.status(200).json(decodeduser);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// user password update
exports.updateUserPassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(404).send({
        success: false,
        message: "Old Password and New Password is requied in body",
      });
    }
    const { id, password } = req.decodedUser;

    const isMatch = await bcrypt.compare(old_password, password);

    if (!isMatch) {
      return res.status(403).json({
        success: false,
        error: "Your Old Password is not correct",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const [result] = await db.query(`UPDATE users SET password=? WHERE id =?`, [
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
      message: "User password updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in password Update User",
      error: error.message,
    });
  }
};

// update user
exports.updateUser = async (req, res) => {
  try {
    const userID = req.decodedUser.id;
    const userName = req.decodedUser.name;
    const userPhone = req.decodedUser.phone;
    const profilePic = req.decodedUser.profile_pic;
    const preAddress = req.decodedUser.address;
    const preProfession = req.decodedUser.profession;

    const { name, profile_pic, phone, address, profession } = req.body;

    const [data] = await db.query(
      `UPDATE users SET name=?, phone=?, profile_pic=?, address=?, profession=? WHERE id =?`,
      [
        name || userName,
        phone || userPhone,
        profile_pic || profilePic,
        address || preAddress,
        profession || preProfession,
        userID,
      ]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update User ",
      });
    }
    res.status(200).send({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update User ",
      error: error.message,
    });
  }
};

// update status
exports.updateStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(404).send({
        success: false,
        message: "User ID is required in params",
      });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(404).send({
        success: false,
        message: "status is requied in body",
      });
    }

    const [checkData] = await db.query(`SELECT * FROM users WHERE id=? `, [
      userId,
    ]);
    if (!checkData || checkData.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No user found",
      });
    }

    const [data] = await db.query(`UPDATE users SET status=?  WHERE id =?`, [
      status,
      userId,
    ]);
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update status ",
      });
    }
    res.status(200).send({
      success: true,
      message: "status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update status ",
      error: error.message,
    });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const userID = req.params.id;
    if (!userID) {
      return res.status(404).send({
        success: false,
        message: "User ID is reqiured in params",
      });
    }

    const [checkData] = await db.query(`SELECT * FROM users WHERE id=? `, [
      userID,
    ]);
    if (!checkData || checkData.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No user found",
      });
    }

    await db.query(`DELETE FROM users WHERE id=?`, [userID]);
    res.status(200).send({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Delete User",
      error: error.message,
    });
  }
};
