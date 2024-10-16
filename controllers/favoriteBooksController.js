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

    const [data] = await db.query(`SELECT * FROM favorite WHERE user_id = ?`, [
      user_id,
    ]);

    // const favoritePromises = data.map(async (item) => {
    //   // Modify this query to include category_image and category_name
    //   const [product] = await db.query(
    //     `SELECT p.*, c.category_image, c.category_name
    //      FROM products p
    //      LEFT JOIN categories c ON p.category_id = c.id
    //      WHERE p.id = ?`,
    //     [item.product_id]
    //   );

    //   if (product && product.length > 0) {
    //     item.name = product[0].name;
    //     item.category_id = product[0].category_id;
    //     item.product_type = product[0].product_type;
    //     item.unit = product[0].unit;
    //     item.long_description = product[0].long_description;
    //     item.short_description = product[0].short_description;
    //     item.status = product[0].status;
    //     item.tax = product[0].tax;
    //     item.country = product[0].country;
    //     item.is_stock = product[0].is_stock;
    //     item.created_at = product[0].created_at;
    //     item.updated_at = product[0].updated_at;
    //     item.purchase_price = product[0].purchase_price;
    //     item.regular_price = product[0].regular_price;
    //     item.selling_price = product[0].selling_price;
    //     item.whole_price = product[0].whole_price;
    //     item.discount_price = product[0].discount_price;

    //     // Add category_image and category_name
    //     item.category_image = product[0].category_image;
    //     item.category_name = product[0].category_name;

    //     // Fetch images related to the product
    //     const [images] = await db.query(
    //       `SELECT id, image_url FROM product_images WHERE product_id = ?`,
    //       [item.product_id]
    //     );
    //     item.images = images.length
    //       ? images.map((image) => ({
    //           image_id: image.id,
    //           image_url: image.image_url,
    //         }))
    //       : [];

    //     // Fetch variants related to the product
    //     const [variants] = await db.query(
    //       `SELECT id, variant_name, variant_value FROM product_variants WHERE product_id = ?`,
    //       [item.product_id]
    //     );
    //     item.variants = variants.map((variant) => ({
    //       variant_id: variant.id,
    //       variant_name: variant.variant_name,
    //       variant_value: variant.variant_value,
    //     }));

    //     // Fetch subcategories related to the product
    //     const [subcategories] = await db.query(
    //       `SELECT * FROM product_sub_categories WHERE product_id = ?`,
    //       [item.product_id]
    //     );

    //     const subcategoryPromises = subcategories.map(async (subCategory) => {
    //       const [subcategoryDetails] = await db.query(
    //         `SELECT id, image, name FROM sub_categories WHERE id = ?`,
    //         [subCategory.sub_category_id]
    //       );
    //       return subcategoryDetails.length
    //         ? {
    //             subCategory_id: subcategoryDetails[0].id,
    //             subCategory_image: subcategoryDetails[0].image,
    //             subCategory_name: subcategoryDetails[0].name,
    //           }
    //         : null;
    //     });

    //     item.subcategories = await Promise.all(subcategoryPromises);

    //     // Fetch tags related to the product
    //     const [tags] = await db.query(
    //       `SELECT tag_name FROM product_tags WHERE product_id = ?`,
    //       [item.product_id]
    //     );
    //     item.tags = tags.map((tag) => tag.tag_name);
    //   } else {
    //     item.name = null;
    //     item.category_id = null;
    //     item.product_type = null;
    //     item.unit = null;
    //     item.long_description = null;
    //     item.short_description = null;
    //     item.status = null;
    //     item.tax = null;
    //     item.country = null;
    //     item.is_stock = null;
    //     item.created_at = null;
    //     item.updated_at = null;
    //     item.purchase_price = null;
    //     item.regular_price = null;
    //     item.selling_price = null;
    //     item.whole_price = null;
    //     item.discount_price = null;
    //     item.images = [];
    //     item.variants = [];
    //     item.subcategories = [];
    //     item.tags = [];
    //     item.category_image = null;
    //     item.category_name = null;
    //   }
    // });

    // await Promise.all(favoritePromises);

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