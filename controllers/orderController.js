const db = require("../config/db");

// Create order
exports.createOrder = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const {
      book_id,
      price,
      delivery_address_id,
      delivery_fee,
      quantity,
      total_price,
      payment_method,
    } = req.body;

    if (
      !book_id ||
      !price ||
      !delivery_address_id ||
      !delivery_fee ||
      !quantity ||
      !total_price ||
      !payment_method
    ) {
      return res.status(400).send({
        success: false,
        message:
          "user_id, book_id, price, delivery_address_id, delivery_fee, quantity, total_price & payment_method is required in body",
      });
    }

    // Insert into `orders` table
    const [orderResult] = await db.execute(
      `INSERT INTO orders (user_id, book_id, price, delivery_address_id, delivery_fee, quantity, total_price, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        book_id,
        price,
        delivery_address_id,
        delivery_fee,
        quantity,
        total_price,
        payment_method,
      ]
    );

    const orderId = orderResult.insertId; // Get the inserted order ID

    // Success response
    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      order_id: orderId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the order",
      error: error.message,
    });
  }
};

// get my order
exports.getMyOrder = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;

    const [data] = await db.query(
      `SELECT 
          o.*, 
          b.*, 
          COUNT(r.rating) AS total_ratings, 
          COALESCE(AVG(r.rating), 0) AS average_rating
       FROM orders o
       JOIN books b ON o.book_id = b.book_id
       LEFT JOIN rating r ON b.book_id = r.book_id
       WHERE o.user_id = ? 
       GROUP BY o.id, b.book_id
       ORDER BY o.id DESC`,
      [user_id]
    );

    const [userData] = await db.query(`SELECT * FROM users WHERE id = ?`, [
      user_id,
    ]);

    res.status(200).send({
      success: true,
      message: "Get My Orders",
      userData: userData[0],
      ordersData: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// get all order
exports.getAllOrder = async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT 
        o.id AS order_id, 
        o.*, 
        b.*, 
        COUNT(r.rating) AS total_ratings,
        COALESCE(AVG(r.rating), 0) AS average_rating
      FROM orders o
      LEFT JOIN books b ON o.book_id = b.book_id
      LEFT JOIN rating r ON b.book_id = r.book_id
      GROUP BY o.id, b.book_id
      ORDER BY o.id DESC`
    );

    res.status(200).send({
      success: true,
      message: "Get All Orders",
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

// get Single order
exports.getSingleOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const [data] = await db.query(
      `SELECT 
          o.*, 
          b.*, 
          COUNT(r.rating) AS total_ratings, 
          COALESCE(AVG(r.rating), 0) AS average_rating
       FROM orders o
       JOIN books b ON o.book_id = b.book_id
       LEFT JOIN rating r ON b.book_id = r.book_id
       WHERE o.id = ?
       GROUP BY o.id, b.book_id`,
      [orderId]
    );

    const [userData] = await db.query(`SELECT * FROM users WHERE id = ?`, [
      data[0].user_id,
    ]);

    res.status(200).send({
      success: true,
      message: "Get Single Orders",
      userData: userData[0],
      ordersData: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return res.status(404).send({
        success: false,
        message: "order ID is required in params",
      });
    }

    const { order_status } = req.body;
    if (!order_status) {
      return res.status(404).send({
        success: false,
        message: "order_status is requied in body",
      });
    }

    const [checkData] = await db.query(`SELECT * FROM orders WHERE id=? `, [
      orderId,
    ]);
    if (!checkData || checkData.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No order found",
      });
    }

    const [data] = await db.query(
      `UPDATE orders SET order_status=?  WHERE id =?`,
      [order_status, orderId]
    );
    if (!data) {
      return res.status(500).send({
        success: false,
        message: "Error in update status ",
      });
    }
    res.status(200).send({
      success: true,
      message: "status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Update status ",
      error: error.message,
    });
  }
};
