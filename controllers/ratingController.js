const db = require("../config/db");

// add rating
exports.addRating = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const { book_id, rating, feedback } = req.body;

    if (!book_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide book_id, rating & feedback required fields",
      });
    }
    const [result] = await db.query(
      "INSERT INTO rating (user_id, book_id, rating, feedback) VALUES (?, ?, ?, ?)",
      [user_id, book_id, rating, feedback]
    );

    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to rating, please try again",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book add to rating successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred while Book adding rating",
      error: error.message,
    });
  }
};

// my rating
exports.myRating = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;

    const [data] = await db.query("SELECT * FROM rating WHERE user_id =?", [
      user_id,
    ]);

    return res.status(200).json({
      success: true,
      message: "Get My Rating",
      data: data,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred while Book getting rating",
      error: error.message,
    });
  }
};

// update Update Rating
exports.updateRating = async (req, res) => {
  try {
    const ratingId = req.params.id;
    if (!ratingId) {
      return res.status(400).send({
        success: false,
        message: "Rating ID is required in params",
      });
    }

    const { rating, feedback } = req.body;

    // Check if Rating exists
    const [existingRating] = await db.query(
      "SELECT * FROM rating WHERE id = ?",
      [ratingId]
    );

    if (!existingRating || existingRating.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Rating not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE rating SET rating = ?, feedback=? WHERE id = ?",
      [
        rating || existingRating[0].rating,
        feedback || existingRating[0].feedback,
        ratingId,
      ]
    );

    // Check if the Rating was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Rating not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Rating updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating Rating",
      error: error.message,
    });
  }
};
