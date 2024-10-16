const db = require("../config/db");

// create paragraph
exports.createParagraph = async (req, res) => {
  try {
    const { book_id, main_toc_id, sub_toc_id, content, page_number } = req.body;
    if (!book_id || !main_toc_id || !sub_toc_id || !content || !page_number) {
      return res.status(400).send({
        success: false,
        message:
          "Please provide book_id, main_toc_id, sub_toc_id, content & page_number field",
      });
    }

    // Insert paragraph into the database
    const [result] = await db.query(
      "INSERT INTO paragraph (book_id, main_toc_id, sub_toc_id, content, page_number) VALUES (?, ?, ?, ?, ?)",
      [book_id, main_toc_id, sub_toc_id, content, page_number]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert paragraph, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "paragraph inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the paragraph",
      error: error.message,
    });
  }
};

// get all paragraph
exports.getAllParagraph = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM paragraph");

    res.status(200).send({
      success: true,
      message: "Get All paragraph",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All paragraph",
      error: error.message,
    });
  }
};

// get single paragraph
exports.getSingleParagraph = async (req, res) => {
  try {
    const para_id = req.params.id;

    const [data] = await db.query("SELECT * FROM paragraph WHERE para_id =?", [
      para_id,
    ]);
    if (!data || data.length == 0) {
      return res.status(404).send({
        success: true,
        message: "No paragraph found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single paragraph",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single paragraph",
      error: error.message,
    });
  }
};

// update paragraph
exports.updateParagraph = async (req, res) => {
  try {
    const para_id = req.params.id;

    const { content, page_number } = req.body;

    // Check if paragraph exists
    const [existingParagraph] = await db.query(
      "SELECT * FROM paragraph WHERE para_id = ?",
      [para_id]
    );

    if (!existingParagraph || existingParagraph.length === 0) {
      return res.status(404).send({
        success: false,
        message: "paragraph not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE paragraph SET content = ?, page_number= ? WHERE para_id = ?",
      [
        content || existingParagraph[0].content,
        page_number || existingParagraph[0].page_number,
        para_id,
      ]
    );

    // Check if the Paragraph was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "paragraph not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "paragraph updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating paragraph",
      error: error.message,
    });
  }
};

// delete paragraph
exports.deleteParagraph = async (req, res) => {
  try {
    const para_id = req.params.id;

    if (!para_id) {
      return res.status(400).send({
        success: false,
        message: "para_id is required",
      });
    }

    // Check if the paragraph exists in the database
    const [SubTOC] = await db.query(
      `SELECT * FROM paragraph WHERE para_id = ?`,
      [para_id]
    );

    // If Paragraph not found, return 404
    if (SubTOC.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Paragraph not found",
      });
    }

    // Proceed to delete the SubTOC
    const [result] = await db.query(`DELETE FROM paragraph WHERE para_id = ?`, [
      para_id,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete paragraph",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "paragraph deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting paragraph",
      error: error.message,
    });
  }
};
