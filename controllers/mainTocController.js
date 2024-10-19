const db = require("../config/db");

// create main toc
exports.createMainToc = async (req, res) => {
  try {
    const { book_id, title, page_number, look_status } = req.body;
    if (!book_id || !title || !page_number || !look_status) {
      return res.status(400).send({
        success: false,
        message:
          "Please provide book_id, title, page_number & look_status field",
      });
    }

    // Insert main toc into the database
    const [result] = await db.query(
      "INSERT INTO main_toc (book_id, title, page_number, look_status) VALUES (?, ?, ?, ?)",
      [book_id, title, page_number, look_status]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert main toc, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "main toc inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the main toc",
      error: error.message,
    });
  }
};

// get all main toc with sub toc
exports.getAllMainTocWithSubToc = async (req, res) => {
  try {
    const book_id = req.params.id;

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
        st.is_paragraph AS sub_toc_is_paragraph,
        st.created_at AS sub_toc_created_at,
        st.updated_at AS sub_toc_updated_at
      FROM main_toc mt
      LEFT JOIN sub_toc st ON mt.main_toc_id = st.main_toc_id
      WHERE mt.book_id = ?
      ORDER BY mt.main_toc_id DESC
    `,
      [book_id]
    );

    // If no TOC data found
    if (!tocData || tocData.length === 0) {
      return res.status(200).send({
        success: true,
        message: "No main TOC found",
        result: [],
      });
    }

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
      message: "Main TOC and Sub TOC retrieved successfully",
      bookInfo: book[0],
      totalMainTocs: result.length,
      data: result,
    });
  } catch (error) {
    // Handle any errors
    res.status(500).send({
      success: false,
      message: "Error in retrieving Main TOC with Sub TOC",
      error: error.message,
    });
  }
};

// get all main toc
exports.getAllMainToc = async (req, res) => {
  try {
    const book_id = req.params.id;

    const [data] = await db.query("SELECT * FROM main_toc WHERE book_id=?", [
      book_id,
    ]);
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No main toc found",
        data: [],
      });
    }

    const [book] = await db.query(
      `SELECT books.*, category.name AS category_name
       FROM books
       LEFT JOIN category ON books.category_id = category.id
       WHERE books.book_id = ?`,
      [book_id]
    );

    res.status(200).send({
      success: true,
      message: "Get All main toc",
      bookInfo: book[0],
      mainToc: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All main toc",
      error: error.message,
    });
  }
};

// get single main toc
exports.getSingleMainToc = async (req, res) => {
  try {
    const main_toc_id = req.params.id;

    if (!main_toc_id) {
      return res.status(400).send({
        success: false,
        message: "Main TOC ID is required",
      });
    }

    const [data] = await db.query(
      "SELECT * FROM main_toc WHERE main_toc_id =?",
      [main_toc_id]
    );
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No Main TOC found",
      });
    }

    const [book] = await db.query(
      `SELECT books.*, category.name AS category_name
       FROM books
       LEFT JOIN category ON books.category_id = category.id
       WHERE books.book_id = ?`,
      [data[0].book_id]
    );

    res.status(200).send({
      success: true,
      message: "Get Single Main TOC",
      bookInfo: book[0],
      mainToc: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single Main TOC",
      error: error.message,
    });
  }
};

// update Main TOC
exports.updateMainTOC = async (req, res) => {
  try {
    const main_toc_id = req.params.id;

    if (!main_toc_id) {
      return res.status(400).send({
        success: false,
        message: "Main TOC ID is required",
      });
    }

    const { title, page_number, look_status } = req.body;

    // Check if Main Toc exists
    const [existingMainToc] = await db.query(
      "SELECT * FROM main_toc WHERE main_toc_id = ?",
      [main_toc_id]
    );

    if (!existingMainToc || existingMainToc.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Main TOC not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE main_toc SET title = ?, page_number= ?, look_status=? WHERE main_toc_id = ?",
      [
        title || existingMainToc[0].title,
        page_number || existingMainToc[0].page_number,
        look_status || existingMainToc[0].look_status,
        main_toc_id,
      ]
    );

    // Check if the main toc was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Main TOC not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Main TOC updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating Main TOC",
      error: error.message,
    });
  }
};

// delete Main TOC
exports.deleteMainTOC = async (req, res) => {
  try {
    const main_toc_id = req.params.id;

    if (!main_toc_id) {
      return res.status(400).send({
        success: false,
        message: "main_toc_id is required",
      });
    }

    // Check if the Main TOC exists in the database
    const [MainTOC] = await db.query(
      `SELECT * FROM main_toc WHERE main_toc_id = ?`,
      [main_toc_id]
    );

    // If MainTOC not found, return 404
    if (MainTOC.length === 0) {
      return res.status(404).send({
        success: false,
        message: "MainTOC not found",
      });
    }

    // Proceed to delete the MainTOC
    const [result] = await db.query(
      `DELETE FROM main_toc WHERE main_toc_id = ?`,
      [main_toc_id]
    );

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete Main TOC",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Main TOC deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting Main TOC",
      error: error.message,
    });
  }
};
