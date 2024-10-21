const db = require("../config/db");

// create Banner
exports.createBanner = async (req, res) => {
  try {
    const { title, image, category_id } = req.body;

    if (!image) {
      return res.status(400).send({
        success: false,
        message: "Please provide image field",
      });
    }

    // Insert Banner into the database
    const [result] = await db.query(
      "INSERT INTO banner (title, image, category_id) VALUES (?, ?, ?)",
      [title || "", image, category_id || 1]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Banner, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Banner inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Banner",
      error: error.message,
    });
  }
};

// get all paymentMethod
exports.getAllBanner = async (req, res) => {
  try {
    const [data] = await db.query(`SELECT * FROM paymentMethod`);

    res.status(200).send({
      success: true,
      message: "Get All paymentMethod",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All paymentMethod",
      error: error.message,
    });
  }
};

// get single PaymentMethod By Id
exports.getSinglePaymentMethodById = async (req, res) => {
  try {
    const paymentMethodID = req.params.id;

    const [data] = await db.query(`SELECT * FROM paymentMethod WHERE id=?`, [
      paymentMethodID,
    ]);
    if (!data || data.length == 0) {
      return res.status(404).send({
        success: false,
        message: "No paymentMethod Found found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single paymentMethod",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single paymentMethod",
      error: error.message,
    });
  }
};

// update PaymentMethod
exports.updateBanner = async (req, res) => {
  try {
    const paymentMethodID = req.params.id;

    const { logoImage, methodName, acocuntNumber, accountType, charge } =
      req.body;

    // Check if book exists
    const [existingPaymentMethod] = await db.query(
      "SELECT * FROM paymentMethod WHERE id = ?",
      [paymentMethodID]
    );

    if (!existingPaymentMethod || existingPaymentMethod.length === 0) {
      return res.status(404).send({
        success: false,
        message: "paymentMethod not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      `UPDATE paymentMethod SET logoImage=?, methodName=?, acocuntNumber=?, accountType=?, charge =? WHERE id = ?`,
      [
        logoImage || existingPaymentMethod[0].logoImage,
        methodName || existingPaymentMethod[0].methodName,
        acocuntNumber || existingPaymentMethod[0].acocuntNumber,
        accountType || existingPaymentMethod[0].accountType,
        charge || existingPaymentMethod[0].charge,
        paymentMethodID,
      ]
    );

    // Check if the paymentMethod was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "paymentMethod not changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "paymentMethod updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating paymentMethod",
      error: error.message,
    });
  }
};

// delete PaymentMethod
exports.deleteBanner = async (req, res) => {
  try {
    const paymentMethodID = req.params.id;

    // Check if the paymentMethod exists in the database
    const [paymentMethodData] = await db.query(
      `SELECT * FROM paymentMethod WHERE id = ?`,
      [paymentMethodID]
    );

    // If paymentMethodData not found, return 404
    if (paymentMethodData.length === 0) {
      return res.status(404).send({
        success: false,
        message: "paymentMethodData not found",
      });
    }

    // Proceed to delete the paymentMethodData
    const [result] = await db.query(`DELETE FROM paymentMethod WHERE id = ?`, [
      paymentMethodID,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete paymentMethod",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "paymentMethod deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting paymentMethod",
      error: error.message,
    });
  }
};
