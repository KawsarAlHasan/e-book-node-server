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

    const [data] = await db.query("SELECT * from orders WHERE user_id =?", [
      user_id,
    ]);

    res.status(200).send({
      success: true,
      message: "Get My Orders",
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
