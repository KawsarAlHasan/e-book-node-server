const db = require("../config/db");

// create sub toc
exports.createSubToc = async (req, res) => {
  try {
    const { main_toc_id, book_id, title, page_number, look_status } = req.body;
    if (!main_toc_id || !book_id || !title || !page_number || !look_status) {
      return res.status(400).send({
        success: false,
        message:
          "Please provide main_toc_id, book_id, title, page_number & look_status field",
      });
    }

    // Insert toc into the database
    const [result] = await db.query(
      "INSERT INTO sub_toc (main_toc_id, book_id, title, page_number, look_status) VALUES (?, ?, ?, ?, ?)",
      [main_toc_id, book_id, title, page_number, look_status]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert sub toc, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "sub toc inserted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the sub toc",
      error: error.message,
    });
  }
};

// get all sub toc
exports.getAllSubToc = async (req, res) => {
  try {
    const main_toc_id = req.params.id;

    const [data] = await db.query(
      "SELECT * FROM sub_toc WHERE main_toc_id =?",
      [main_toc_id]
    );

    res.status(200).send({
      success: true,
      message: "Get All sub toc",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All sub toc",
      error: error.message,
    });
  }
};

// get single sub toc
exports.getSingleSubToc = async (req, res) => {
  try {
    const sub_toc_id = req.params.id;

    if (!sub_toc_id) {
      return res.status(400).send({
        success: false,
        message: "sub_toc_id is required",
      });
    }

    const [data] = await db.query("SELECT * FROM sub_toc WHERE sub_toc_id =?", [
      sub_toc_id,
    ]);
    if (!data || data.length == 0) {
      return res.status(404).send({
        success: true,
        message: "No sub TOC found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single sub TOC",
      data: data[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get single sub TOC",
      error: error.message,
    });
  }
};

// update sub TOC
exports.updateSubTOC = async (req, res) => {
  try {
    const sub_toc_id = req.params.id;

    if (!sub_toc_id) {
      return res.status(400).send({
        success: false,
        message: "sub TOC ID is required",
      });
    }

    const { title, page_number, look_status } = req.body;

    // Check if sub Toc exists
    const [existingSubToc] = await db.query(
      "SELECT * FROM sub_toc WHERE sub_toc_id = ?",
      [sub_toc_id]
    );

    if (!existingSubToc || existingSubToc.length === 0) {
      return res.status(404).send({
        success: false,
        message: "sub TOC not found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE sub_toc SET title = ?, page_number= ?, look_status=? WHERE sub_toc_id = ?",
      [
        title || existingSubToc[0].title,
        page_number || existingSubToc[0].page_number,
        look_status || existingSubToc[0].look_status,
        sub_toc_id,
      ]
    );

    // Check if the sub-toc was updated successfully
    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "sub TOC not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "sub TOC updated successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).send({
      success: false,
      message: "Error updating sub TOC",
      error: error.message,
    });
  }
};

// delete sub TOC
exports.deleteSubTOC = async (req, res) => {
  try {
    const sub_toc_id = req.params.id;

    if (!sub_toc_id) {
      return res.status(400).send({
        success: false,
        message: "sub_toc_id is required",
      });
    }

    // Check if the sub TOC exists in the database
    const [SubTOC] = await db.query(
      `SELECT * FROM sub_toc WHERE sub_toc_id = ?`,
      [sub_toc_id]
    );

    // If SubTOC not found, return 404
    if (SubTOC.length === 0) {
      return res.status(404).send({
        success: false,
        message: "SubTOC not found",
      });
    }

    // Proceed to delete the SubTOC
    const [result] = await db.query(
      `DELETE FROM sub_toc WHERE sub_toc_id = ?`,
      [sub_toc_id]
    );

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete sub TOC",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "sub TOC deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting sub TOC",
      error: error.message,
    });
  }
};
