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
      sell_price,
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
      "INSERT INTO books (book_name, image, category_id, author, title, language, publisher, publication_year, first_edition_year, last_edition_year, publisher_name, free_or_paid, price, sell_price, total_pages, sort_description, dedication, author_bio, introduction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
        sell_price || 0,
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
      ORDER BY books.book_id DESC
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
      sell_price,
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
      `UPDATE books SET book_name=?, image=?, category_id=?, author=?, title =?, language=?, publisher=?, publication_year=?, first_edition_year=?, last_edition_year=?, publisher_name=?, free_or_paid=?, price=?, sell_price=?, total_pages=?, sort_description=?, dedication=?, author_bio=?, introduction=? WHERE book_id = ?`,
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
        sell_price || existingBook[0].sell_price,
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
    await db.query(`DELETE FROM main_toc WHERE book_id = ?`, [book_id]);
    await db.query(`DELETE FROM sub_toc WHERE book_id = ?`, [book_id]);
    await db.query(`DELETE FROM paragraph WHERE book_id = ?`, [book_id]);

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

// get book main toc with sub toc
exports.getBookWithMainTocAndSubToc = async (req, res) => {
  try {
    const book_id = req.params.id;

    // Fetch related book info
    const [book] = await db.query(
      `
        SELECT books.*, category.name AS category_name
        FROM books
        LEFT JOIN category ON books.category_id = category.id
        WHERE books.book_id = ?
      `,
      [book_id]
    );

    // Fetch main TOC with sub TOC using JOIN
    const [tocData] = await db.query(
      `
      SELECT 
        mt.main_toc_id AS main_toc_id,
        mt.title AS main_toc_name,
        mt.book_id AS book_id,
        mt.page_number AS main_toc_page_number,
        mt.look_status AS main_toc_look_status,
        mt.created_at AS main_toc_created_at,
        mt.updated_at AS main_toc_updated_at,
        st.sub_toc_id AS sub_toc_id,
        st.main_toc_id AS sub_toc_main_toc_id,
        st.title AS sub_toc_name,
        st.book_id AS sub_toc_book_id,
        st.page_number AS sub_toc_page_number,
        st.look_status AS sub_toc_look_status,
        st.is_paragraph AS sub_toc_is_paragraph,
        st.created_at AS sub_toc_created_at,
        st.updated_at AS sub_toc_updated_at
      FROM main_toc mt
      LEFT JOIN sub_toc st ON mt.main_toc_id = st.main_toc_id
      WHERE mt.book_id = ?
      `,
      [book_id]
    );

    // Organize the TOC data into main TOCs with their sub TOCs
    const tocMap = {};
    tocData.forEach((row) => {
      const {
        main_toc_id,
        main_toc_name,
        main_toc_page_number,
        main_toc_look_status,
        main_toc_created_at,
        main_toc_updated_at,
        sub_toc_id,
        sub_toc_main_toc_id,
        sub_toc_name,
        sub_toc_page_number,
        sub_toc_look_status,
        sub_toc_is_paragraph,
        sub_toc_created_at,
        sub_toc_updated_at,
      } = row;

      // If the main TOC is not already in the map, add it
      if (!tocMap[main_toc_id]) {
        tocMap[main_toc_id] = {
          id: main_toc_id,
          name: main_toc_name,
          book_id: book_id,
          page_number: main_toc_page_number,
          look_status: main_toc_look_status,
          created_at: main_toc_created_at,
          updated_at: main_toc_updated_at,
          sub_tocs: [],
        };
      }

      // If the row has a sub TOC, add it to the main TOC
      if (sub_toc_id) {
        tocMap[main_toc_id].sub_tocs.push({
          id: sub_toc_id,
          main_toc_id: sub_toc_main_toc_id,
          name: sub_toc_name,
          page_number: sub_toc_page_number,
          look_status: sub_toc_look_status,
          is_paragraph: sub_toc_is_paragraph,
          created_at: sub_toc_created_at,
          updated_at: sub_toc_updated_at,
        });
      }
    });

    // Convert the TOC map to an array
    const result = Object.values(tocMap);

    // Send success response
    res.status(200).send({
      success: true,
      message: "Get Book With Main TOC and Sub TOC",
      bookInfo: book[0],
      totalMainTocs: result.length,
      mainTOC: result,
    });
  } catch (error) {
    // Handle any errors
    res.status(500).send({
      success: false,
      message: "Error in retrieving Book",
      error: error.message,
    });
  }
};
