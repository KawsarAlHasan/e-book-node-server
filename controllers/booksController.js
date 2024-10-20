const db = require("../config/db");

// create books
exports.createBooks = async (req, res) => {
  try {
    const {
      book_name,
      image,
      category_id,
      author,
      title,
      language,
      publisher,
      publication_year,
      first_edition_year,
      last_edition_year,
      publisher_name,
      free_or_paid,
      price,
      total_pages,
      sort_description,
      dedication,
      author_bio,
      introduction,
    } = req.body;

    if (!book_name || !image || !author || !language) {
      return res.status(400).send({
        success: false,
        message: "Please provide book_name, image, author & language field",
      });
    }

    // Insert books into the database
    const [result] = await db.query(
      "INSERT INTO books (book_name, image, category_id, author, title, language, publisher, publication_year, first_edition_year, last_edition_year, publisher_name, free_or_paid, price, total_pages, sort_description, dedication, author_bio, introduction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        book_name,
        image,
        category_id,
        author,
        title || "NULL",
        language,
        publisher || "NULL",
        publication_year || "NULL",
        first_edition_year || "NULL",
        last_edition_year || "NULL",
        publisher_name || "NULL",
        free_or_paid || "Free",
        price || 0,
        total_pages || 0,
        sort_description || "",
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
    const [data] = await db.query(`
      SELECT 
        books.*, 
        category.name AS category_name, 
        COUNT(rating.rating) AS total_ratings, 
        COALESCE(AVG(rating.rating), 0) AS average_rating
      FROM books
      LEFT JOIN category ON books.category_id = category.id
      LEFT JOIN rating ON books.book_id = rating.book_id
      GROUP BY books.book_id
    `);

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

    const [data] = await db.query(
      `SELECT books.*, category.name AS category_name
       FROM books
       LEFT JOIN category ON books.category_id = category.id
       WHERE books.book_id = ?`,
      [book_id]
    );
    if (!data || data.length == 0) {
      return res.status(404).send({
        success: false,
        message: "No Books Found found",
      });
    }

    const [averageData] = await db.query(
      `SELECT AVG(rating) AS average_rating FROM rating WHERE book_id = ?`,
      [book_id]
    );

    const [allRatings] = await db.query(
      `SELECT * FROM rating WHERE book_id = ?`,
      [book_id]
    );

    const [tocCounts] = await db.query(
      `
      SELECT 
        COUNT(DISTINCT mt.main_toc_id) AS main_toc_count,
        COUNT(st.sub_toc_id) AS sub_toc_count
      FROM main_toc mt
      LEFT JOIN sub_toc st ON mt.main_toc_id = st.main_toc_id
      WHERE mt.book_id = ?
      `,
      [book_id]
    );

    const sendData = {
      ...data[0],
      main_toc: tocCounts[0].main_toc_count,
      sub_toc: tocCounts[0].sub_toc_count,
      total_rating: allRatings.length,
      average_rating: averageData[0].average_rating || 0,
      rating: allRatings,
    };

    res.status(200).send({
      success: true,
      message: "Get Single Books",
      data: sendData,
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
      image,
      category_id,
      author,
      title,
      language,
      publisher,
      publication_year,
      first_edition_year,
      last_edition_year,
      publisher_name,
      free_or_paid,
      price,
      total_pages,
      sort_description,
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
      `UPDATE books SET book_name=?, image=?, category_id=?, author=?, title =?, language=?, publisher=?, publication_year=?, first_edition_year=?, last_edition_year=?, publisher_name=?, free_or_paid=?, price=?, total_pages=?, sort_description=?, dedication=?, author_bio=?, introduction=? WHERE book_id = ?`,
      [
        book_name || existingBook[0].book_name,
        image || existingBook[0].image,
        category_id || existingBook[0].category_id,
        author || existingBook[0].author,
        title || existingBook[0].title,
        language || existingBook[0].language,
        publisher || existingBook[0].publisher,
        publication_year || existingBook[0].publication_year,
        first_edition_year || existingBook[0].first_edition_year,
        last_edition_year || existingBook[0].last_edition_year,
        publisher_name || existingBook[0].publisher_name,
        free_or_paid || existingBook[0].free_or_paid,
        price || existingBook[0].price,
        total_pages || existingBook[0].total_pages,
        sort_description || existingBook[0].sort_description,
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
