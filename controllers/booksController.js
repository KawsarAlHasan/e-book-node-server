const db = require("../config/db");

// create books
exports.createBooks = async (req, res) => {
  try {
    const {
      book_name,
      author,
      title,
      publisher,
      publication_year,
      first_edition_year,
      last_edition_year,
      publisher_name,
      price,
      dedication,
      author_bio,
      introduction,
    } = req.body;
    if (!book_name || !author) {
      return res.status(400).send({
        success: false,
        message: "Please provide book_name & author field",
      });
    }

    // Insert books into the database
    const [result] = await db.query(
      "INSERT INTO books (book_name, author, title,	publisher, publication_year, first_edition_year, last_edition_year, publisher_name, price, dedication, author_bio, introduction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        book_name,
        author,
        title || "NULL",
        publisher || "NULL",
        publication_year || "NULL",
        first_edition_year || "NULL",
        last_edition_year || "NULL",
        publisher_name || "NULL",
        price || 0,
        dedication || "NULL",
        author_bio || "NULL",
        introduction || "NULL",
      ]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert books, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "books inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the books",
      error: error.message,
    });
  }
};

// get all Books
exports.getAllBooks = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM books");
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No Books found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get All Books",
      totalBooks: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Books",
      error: error.message,
    });
  }
};

// get single Books By Id
exports.getSingleBooksById = async (req, res) => {
  try {
    const book_id = req.params.id;

    const [data] = await db.query("SELECT * FROM books WHERE book_id =?", [
      book_id,
    ]);
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No Books Found found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Books",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single Books",
      error: error.message,
    });
  }
};

// update Book
exports.updateBook = async (req, res) => {
  try {
    const book_id = req.params.id;

    const {
      book_name,
      author,
      title,
      publisher,
      publication_year,
      first_edition_year,
      last_edition_year,
      publisher_name,
      price,
      dedication,
      author_bio,
      introduction,
    } = req.body;

    // Check if book exists
    const [existingBook] = await db.query(
      "SELECT * FROM books WHERE book_id = ?",
      [book_id]
    );

    if (!existingBook || existingBook.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Books not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      `UPDATE books SET book_name=?, author=?, title =?, publisher=?, publication_year=?, first_edition_year=?, last_edition_year=?, publisher_name=?, price=?, dedication=?, author_bio=?, introduction=? WHERE book_id = ?`,
      [
        book_name || existingBook[0].book_name,
        author || existingBook[0].author,
        title || existingBook[0].title,
        publisher || existingBook[0].publisher,
        publication_year || existingBook[0].publication_year,
        first_edition_year || existingBook[0].first_edition_year,
        last_edition_year || existingBook[0].last_edition_year,
        publisher_name || existingBook[0].publisher_name,
        price || existingBook[0].price,
        dedication || existingBook[0].dedication,
        author_bio || existingBook[0].author_bio,
        introduction || existingBook[0].introduction,
        book_id,
      ]
    );

    // Check if the Books was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Books not changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Books updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating Books",
      error: error.message,
    });
  }
};

// delete books
exports.deleteBook = async (req, res) => {
  try {
    const book_id = req.params.id;

    // Check if the Books exists in the database
    const [booksData] = await db.query(
      `SELECT * FROM books WHERE book_id = ?`,
      [book_id]
    );

    // If booksData not found, return 404
    if (booksData.length === 0) {
      return res.status(404).send({
        success: false,
        message: "booksData not found",
      });
    }

    // Proceed to delete the booksData
    const [result] = await db.query(`DELETE FROM books WHERE book_id = ?`, [
      book_id,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete Books",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Books deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting Books",
      error: error.message,
    });
  }
};
