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

// get all banner
exports.getAllBanner = async (req, res) => {
  try {
    const [data] = await db.query(`SELECT * FROM banner`);

    res.status(200).send({
      success: true,
      message: "Get All banner",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All banner",
      error: error.message,
    });
  }
};

// get single banner By Id
exports.getSinglebannerById = async (req, res) => {
  try {
    const bannerID = req.params.id;

    const [data] = await db.query(`SELECT * FROM banner WHERE id=?`, [
      bannerID,
    ]);
    if (!data || data.length == 0) {
      return res.status(404).send({
        success: false,
        message: "Banner Not Found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Banner",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single Banner",
      error: error.message,
    });
  }
};

// update Banner
exports.updateBanner = async (req, res) => {
  try {
    const bannerID = req.params.id;

    const { title, image, category_id } = req.body;

    // Check if book exists
    const [existingBanner] = await db.query(
      "SELECT * FROM banner WHERE id = ?",
      [bannerID]
    );

    if (!existingBanner || existingBanner.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Banner not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      `UPDATE banner SET title=?, image=?, category_id=? WHERE id = ?`,
      [
        title || existingBanner[0].title,
        image || existingBanner[0].image,
        category_id || existingBanner[0].category_id,
        bannerID,
      ]
    );

    // Check if the banner was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "banner not changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "banner updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating banner",
      error: error.message,
    });
  }
};

// delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const bannerID = req.params.id;

    // Check if book exists
    const [existingBanner] = await db.query(
      "SELECT * FROM banner WHERE id = ?",
      [bannerID]
    );

    // If Banner not found, return 404
    if (existingBanner.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Banner not found",
      });
    }

    // Proceed to delete the Banner
    const [result] = await db.query(`DELETE FROM banner WHERE id = ?`, [
      bannerID,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete banner",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "banner deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting banner",
      error: error.message,
    });
  }
};
