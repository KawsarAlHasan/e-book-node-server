const db = require("../config/db");

// create category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({
        success: false,
        message: "name is reqiured in body",
      });
    }

    const [data] = await db.execute("INSERT INTO category (name) VALUES (?)", [
      name,
    ]);

    if (!data.insertId) {
      return res.status(400).send({
        success: false,
        message: "Data inserted faild",
      });
    }

    res.status(200).send({
      success: true,
      message: "Category added successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// get category
exports.getCategory = async (req, res) => {
  try {
    const [data] = await db.execute("SELECT * FROM category");

    res.status(200).send({
      success: true,
      message: "Get All Category",
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// upadate category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const [data] = await db.execute("SELECT * FROM category WHERE id=?", [id]);

    if (!data || data.length == 0) {
      return res.status(400).send({
        success: false,
        message: "Category not found",
      });
    }

    const [updateData] = await db.execute(
      "UPDATE category SET name=? WHERE id =?",
      [name || data[0].name, id]
    );

    if (updateData.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "Category not Updated",
      });
    }

    res.status(200).send({
      success: true,
      message: "Update Category successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
