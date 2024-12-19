const db = require("../config/db");

// create paragraph
exports.createParagraph = async (req, res) => {
  try {
    const {
      book_id,
      main_toc_id,
      sub_toc_id,
      content,
      page_number,
      mark_text,
    } = req.body;
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

    await db.query("UPDATE sub_toc SET is_paragraph = 1 WHERE sub_toc_id = ?", [
      sub_toc_id,
    ]);

    const paraID = result.insertId;

    if (mark_text.length > 0) {
      const markTextQuery =
        "INSERT INTO mark_text (para_id, text, definition) VALUES ?";
      const markTextValues = mark_text.map((markText) => [
        paraID,
        markText.text,
        markText.definition,
      ]);
      await db.query(markTextQuery, [markTextValues]);
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

// get paragraph
exports.getSingleParagraph = async (req, res) => {
  try {
    const sub_toc_id = req.params.id;

    const [data] = await db.query(
      "SELECT * FROM paragraph WHERE sub_toc_id =?",
      [sub_toc_id]
    );
    if (!data || data.length == 0) {
      return res.status(404).send({
        success: true,
        message: "No paragraph found",
      });
    }

    const [markTextData] = await db.query(
      "SELECT * FROM mark_text WHERE para_id =?",
      [data[0].para_id]
    );

    res.status(200).send({
      success: true,
      message: "Get Single paragraph",
      data: data,
      markTextData,
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

    await db.query("UPDATE sub_toc SET is_paragraph = 0 WHERE sub_toc_id = ?", [
      SubTOC[0].sub_toc_id,
    ]);

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

// add MarkText
exports.addMarkText = async (req, res) => {
  try {
    const { para_id, text, definition } = req.body;

    if (!para_id || !text || !definition) {
      return res.status(400).send({
        success: false,
        message: "Please provide para_id, text & definition field",
      });
    }

    // Insert Mark Text into the database
    const [result] = await db.query(
      "INSERT INTO mark_text (para_id, text, definition) VALUES (?, ?, ?)",
      [para_id, text, definition]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Mark Text, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Mark Text inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Mark Text",
      error: error.message,
    });
  }
};

// update MarkText
exports.updateMarkText = async (req, res) => {
  try {
    const mark_id = req.params.id;

    const { text, definition } = req.body;

    // Check if MarkText exists
    const [existingMarkText] = await db.query(
      "SELECT * FROM mark_text WHERE id = ?",
      [mark_id]
    );

    if (!existingMarkText || existingMarkText.length === 0) {
      return res.status(404).send({
        success: false,
        message: "MarkText not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE mark_text SET text = ?, definition= ? WHERE id = ?",
      [
        text || existingMarkText[0].text,
        definition || existingMarkText[0].definition,
        mark_id,
      ]
    );

    // Check if the MarkText was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "MarkText not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "MarkText updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating MarkText",
      error: error.message,
    });
  }
};

// delete MarkText
exports.deleteMarkText = async (req, res) => {
  try {
    const mark_id = req.params.id;

    // Check if the mark_text exists in the database
    const [SubTOC] = await db.query(`SELECT * FROM mark_text WHERE id = ?`, [
      mark_id,
    ]);

    // If mark_text not found, return 404
    if (SubTOC.length === 0) {
      return res.status(404).send({
        success: false,
        message: "mark_text not found",
      });
    }

    // Proceed to delete the SubTOC
    await db.query(`DELETE FROM favorite_mark_text WHERE mark_text_id = ?`, [
      mark_id,
    ]);

    // Proceed to delete the SubTOC
    const [result] = await db.query(`DELETE FROM mark_text WHERE id = ?`, [
      mark_id,
    ]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete mark_text",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "mark_text deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting mark_text",
      error: error.message,
    });
  }
};

// get Mark text
exports.getMarkText = async (req, res) => {
  try {
    const para_id = req.params.id;

    const [data] = await db.query("SELECT * FROM mark_text WHERE para_id =?", [
      para_id,
    ]);

    res.status(200).send({
      success: true,
      message: "Get Single Mark Text",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Mark Text",
      error: error.message,
    });
  }
};
