const db = require("../config/db");

// add favorite
exports.addFavorite = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const { book_id } = req.body;

    if (!book_id) {
      return res.status(400).send({
        success: false,
        message: "Please provide book_id required fields",
      });
    }

    const [result] = await db.query(
      "INSERT INTO favorite (user_id, book_id) VALUES (?, ?)",
      [user_id, book_id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Book add to favorite, please try again",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book add to favorite successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred while Book adding favorite",
      error: error.message,
    });
  }
};

// check favorite Book
exports.checkFavorite = async (req, res) => {
  try {
    const book_id = req.params.id;
    const user_id = req.decodedUser.id;

    // Execute the query to check if the books is a favorite
    const [data] = await db.query(
      `SELECT * FROM favorite WHERE user_id = ? AND book_id = ?`,
      [user_id, book_id]
    );

    // If no data is returned, it's not a favorite books
    if (data.length === 0) {
      return res.status(200).send({
        message: "This books is not in your favorite",
        favorite: false,
      });
    }

    // If data exists, it's a favorite books
    return res.status(200).send({
      message: "This books is in your favorite",
      favorite: true,
    });
  } catch (error) {
    // Handle errors appropriately
    return res.status(500).send({
      success: false,
      message: "Error in checking favorite books",
      error: error.message,
    });
  }
};

// get all favorite Books
exports.getAllFavoriteBooks = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const userData = req.decodedUser;

    // Query to join favorite and book table to fetch book details
    const [data] = await db.query(
      `SELECT 
        f.favorite_id, 
        f.user_id, 
        f.book_id, 
        b.*
      FROM favorite f 
      JOIN books b ON f.book_id = b.book_id 
      WHERE f.user_id = ?`,
      [user_id]
    );

    res.status(200).send({
      success: true,
      message: "Get all Favorite Books",
      userID: userData.id,
      userName: userData.name,
      userEmail: userData.email,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in getting all Books from Favorite",
      error: error.message,
    });
  }
};

// delete All Books from Favorite
exports.deleteAllBooksFromFavorite = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;

    const [data] = await db.query(`SELECT * FROM favorite WHERE user_id=? `, [
      user_id,
    ]);
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Books found from favorite",
      });
    }
    await db.query(`DELETE FROM favorite WHERE user_id=?`, [user_id]);
    res.status(200).send({
      success: true,
      message: "Delete all Books from favorite",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in delete all Books from favorite",
      error: error.message,
    });
  }
};

// delete Single Book from Favorite
exports.deleteSingleBookFromFavorite = async (req, res) => {
  try {
    const book_id = req.params.id;
    const user_id = req.decodedUser.id;

    // Execute the query to check if the Book is a favorite
    const [data] = await db.query(
      `SELECT * FROM favorite WHERE user_id = ? AND book_id = ?`,
      [user_id, book_id]
    );
    if (!data || data.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No Book found from favorite",
      });
    }
    await db.query(`DELETE FROM favorite WHERE user_id = ? AND book_id = ?`, [
      user_id,
      book_id,
    ]);
    res.status(200).send({
      success: true,
      message: "Delete Single Book from favorite",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in delete Single Book from favorite",
      error: error.message,
    });
  }
};
