const db = require("../config/db");

// add favorite mark text
exports.addFavoriteMarkText = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const { mark_text_id } = req.body;

    if (!mark_text_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide book_id required fields",
      });
    }

    const [result] = await db.query(
      "INSERT INTO favorite_mark_text (user_id, mark_text_id) VALUES (?, ?)",
      [user_id, mark_text_id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Mark text add favorite, please try again",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mark text add favorite successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred while Mark Text adding favorite",
      error: error.message,
    });
  }
};

// check favorite mark text
exports.checkFavoriteMarkText = async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.decodedUser.id;

    // Execute the query to check if the mark text is a favorite
    const [data] = await db.query(
      `SELECT * FROM favorite_mark_text WHERE user_id = ? AND id = ?`,
      [user_id, id]
    );

    // If no data is returned, it's not a favorite mark text
    if (data.length === 0) {
      return res.status(200).send({
        message: "This mark text is not in your favorite",
        favorite: false,
      });
    }

    // If data exists, it's a favorite mark text
    return res.status(200).send({
      message: "This mark text is in your favorite",
      favorite: true,
    });
  } catch (error) {
    // Handle errors appropriately
    return res.status(500).send({
      success: false,
      message: "Error in checking favorite mark text",
      error: error.message,
    });
  }
};

// get all favorite MarkTex
exports.getAllFavoriteMarkText = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const userData = req.decodedUser;

    // Query to join favorite and book table to fetch book details
    const [data] = await db.query(
      `SELECT 
        f.id, 
        f.user_id, 
        f.mark_text_id, 
        mt.id,
        mt.para_id,
        mt.text,
        mt.definition,
        mt.created_at,
        mt.updated_at
      FROM favorite_mark_text f 
      JOIN mark_text mt ON f.mark_text_id = mt.id 
      WHERE f.user_id = ? ORDER BY f.id DESC`,
      [user_id]
    );

    res.status(200).send({
      success: true,
      message: "Get all Favorite Mark Text",
      userID: userData.id,
      userName: userData.name,
      userEmail: userData.email,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting all Mark Text from Favorite",
      error: error.message,
    });
  }
};

// remove mark text
exports.removeMarkText = async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.decodedUser.id;

    // Execute the query to check if the Book is a favorite
    const [data] = await db.query(
      `SELECT * FROM favorite_mark_text WHERE user_id = ? AND id = ?`,
      [user_id, id]
    );
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Mark Text found from favorite",
      });
    }
    await db.query(
      `DELETE FROM favorite_mark_text WHERE user_id = ? AND id = ?`,
      [user_id, id]
    );
    res.status(200).send({
      success: true,
      message: "Delete Mark Text from favorite",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in delete Mark Text from favorite",
      error: error.message,
    });
  }
};
