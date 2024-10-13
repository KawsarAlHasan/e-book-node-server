const db = require("../config/db");

// create main toc
exports.createMainToc = async (req, res) => {
  try {
    const { book_id, title, page_number } = req.body;
    if (!book_id || !title || !page_number) {
      return res.status(400).send({
        success: false,
        message: "Please provide book_id, title & page_number field",
      });
    }

    // Insert category into the database
    const [result] = await db.query(
      "INSERT INTO main_toc (book_id, title, page_number) VALUES (?, ?, ?)",
      [book_id, title, page_number]
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

// get all main toc
exports.getAllMainToc = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM main_toc");
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No main toc found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get All main toc",
      data: data,
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

    res.status(200).send({
      success: true,
      message: "Get Single Main TOC",
      data: data[0],
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

    const { title, page_number } = req.body;

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
      "UPDATE main_toc SET title = ?, page_number= ? WHERE main_toc_id = ?",
      [
        title || existingMainToc[0].title,
        page_number || existingMainToc[0].page_number,
        main_toc_id,
      ]
    );

    // Check if the sub-category was updated successfully
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
