const db = require("../config/db");

// create coupons
exports.createDiscountCoupons = async (req, res) => {
  try {
    const {
      code,
      discount_price,
      expiration_date,
      is_active,
      book_list_for_coupons,
    } = req.body;
    if (!code || !discount_price) {
      return res.status(400).send({
        success: false,
        message: "Please provide code, discount_price field",
      });
    }

    const [checkData] = await db.query(
      "SELECT * FROM coupons_discount WHERE code=?",
      [code]
    );

    if (checkData.length > 0) {
      return res.status(400).send({
        success: false,
        message: "This Code already used",
      });
    }

    // Insert coupons_discount into the database
    const [result] = await db.query(
      "INSERT INTO coupons_discount (code, discount_price, expiration_date, is_active) VALUES (?, ?, ?, ?)",
      [code, discount_price, expiration_date || null, is_active || 1]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert coupons discount, please try again",
      });
    }

    const couponsID = result.insertId;

    if (book_list_for_coupons.length > 0) {
      for (const book of book_list_for_coupons) {
        await db.query(
          "INSERT INTO book_list_for_coupons (coupons_id, book_id) VALUES (?, ?)",
          [couponsID, book.book_id]
        );
      }
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "coupons discount inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the coupons discount",
      error: error.message,
    });
  }
};

// Get coupons with book list
exports.getAllCouponsDiscount = async (req, res) => {
  try {
    // Fetch all coupons
    const [coupons] = await db.query("SELECT * FROM coupons_discount");

    if (coupons.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No coupons found",
      });
    }

    // Prepare result with book list for each coupon
    const result = [];
    for (const coupon of coupons) {
      // Fetch associated book list for this coupon
      const [books] = await db.query(
        "SELECT id, book_id FROM book_list_for_coupons WHERE coupons_id = ?",
        [coupon.id]
      );

      result.push({
        ...coupon,
        book_list_for_coupons: books.map((book) => ({
          book_id: book.book_id,
        })),
      });
    }

    // Send the final response
    res.status(200).send({
      success: true,
      message: "Get All Coupons",
      totalCoupon: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while fetching coupons",
      error: error.message,
    });
  }
};

// Get coupons with book list
exports.getSingleCouponsDiscount = async (req, res) => {
  try {
    const id = req.params.id;
    const [coupons] = await db.query(
      "SELECT * FROM coupons_discount WHERE id=?",
      id
    );

    if (coupons.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No coupons found",
      });
    }

    const [books] = await db.query(
      "SELECT id, book_id FROM book_list_for_coupons WHERE coupons_id = ?",
      [id]
    );

    const result = {
      ...coupons[0],
      book_list_for_coupons: books.map((book) => ({
        book_id: book.book_id,
      })),
    };

    res.status(200).send({
      success: true,
      message: "Get Single Coupons",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while fetching coupons",
      error: error.message,
    });
  }
};

// update coupons Discount
exports.updateCouponsDiscount = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      code,
      discount_price,
      expiration_date,
      is_active,
      book_list_for_coupons,
    } = req.body;

    const [checkData] = await db.query(
      "SELECT * FROM coupons_discount WHERE code=? AND id !=?",
      [code, id]
    );

    if (checkData.length > 0) {
      return res.status(400).send({
        success: false,
        message: "This Code already used",
      });
    }

    // Check if coupons exists
    const [existingCoupons] = await db.query(
      "SELECT * FROM coupons_discount WHERE id = ?",
      [id]
    );

    if (!existingCoupons || existingCoupons.length === 0) {
      return res.status(404).send({
        success: false,
        message: "coupons not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE coupons_discount SET code = ?, discount_price= ?, expiration_date=?, is_active=? WHERE id = ?",
      [
        code || existingCoupons[0].code,
        discount_price || existingCoupons[0].discount_price,
        expiration_date || existingCoupons[0].expiration_date,
        is_active || existingCoupons[0].is_active,
        id,
      ]
    );

    // Check if the coupons was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "coupons not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "coupons updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating coupons",
      error: error.message,
    });
  }
};

// delete coupons Discount
exports.deleteCouponsDiscount = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the coupons exists in the database
    const [coupons] = await db.query(
      `SELECT * FROM coupons_discount WHERE id = ?`,
      [id]
    );

    // If coupons not found, return 404
    if (coupons.length === 0) {
      return res.status(404).send({
        success: false,
        message: "coupons not found",
      });
    }

    for (const singleData of coupons) {
      const coupons_id = singleData.id;
      await db.query(`DELETE FROM book_list_for_coupons WHERE coupons_id=?`, [
        coupons_id,
      ]);
    }

    const [result] = await db.query(
      `DELETE FROM coupons_discount WHERE id = ?`,
      [id]
    );

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete coupons",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "coupons deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting coupons",
      error: error.message,
    });
  }
};

// Check Coupon Discount
exports.checkCouponDiscount = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).send({
        success: false,
        message: "Please provide code field",
      });
    }

    const [data] = await db.query("SELECT * FROM coupons WHERE code =?", [
      code,
    ]);

    if (!data || data.length == 0) {
      return res.status(400).send({
        success: true,
        message: "No coupons found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Check coupons",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Check coupons",
      error: error.message,
    });
  }
};
