const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Checkout
exports.checkout = async (req, res) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const userId = req.user.id;

        // Get Cart
        const cartResult = await client.query(
            "SELECT * FROM cart WHERE user_id=$1",
            [userId]
        );

        if (cartResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        const cartId = cartResult.rows[0].id;

        const cartItems = await client.query(
            `SELECT
                cart_items.product_id,
                cart_items.quantity,
                products.price
            FROM cart_items
            JOIN products
                ON products.id = cart_items.product_id
            WHERE cart_items.cart_id=$1`,
            [cartId]
        );

        if (cartItems.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        let total = 0;

        cartItems.rows.forEach(item => {
            total += Number(item.price) * item.quantity;
        });

        const orderId = uuidv4();

        await client.query(
            `INSERT INTO orders
            (id,user_id,total_amount,status)
            VALUES($1,$2,$3,$4)`,
            [
                orderId,
                userId,
                total,
                "PLACED"
            ]
        );

        for (const item of cartItems.rows) {

            await client.query(
                `INSERT INTO order_items
                (id,order_id,product_id,quantity,price)
                VALUES($1,$2,$3,$4,$5)`,
                [
                    uuidv4(),
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );

        }

        // Clear Cart
        await client.query(
            "DELETE FROM cart_items WHERE cart_id=$1",
            [cartId]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Order placed successfully",
            orderId
        });

    } catch (err) {

        await client.query("ROLLBACK");

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    } finally {

        client.release();

    }

};


// Get Logged-in User Orders
exports.getOrders = async (req, res) => {

    try {

        const userId = req.user.id;

        const orders = await pool.query(
            `SELECT *
             FROM orders
             WHERE user_id=$1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json(orders.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await pool.query(
            `SELECT orders.*, users.first_name, users.last_name, users.email
             FROM orders
             JOIN users ON users.id = orders.user_id
             ORDER BY orders.created_at DESC`
        );

        res.json(orders.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["PLACED", "PREPARING", "DELIVERING", "DELIVERED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const result = await pool.query(
            `UPDATE orders SET status=$1 WHERE id=$2 RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Single Order with Items
exports.getOrder = async (req, res) => {

    try {

        const { id } = req.params;

        const order = await pool.query(
            "SELECT * FROM orders WHERE id=$1",
            [id]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const items = await pool.query(
            `SELECT
                products.name,
                products.image_url,
                order_items.quantity,
                order_items.price
            FROM order_items
            JOIN products
                ON products.id = order_items.product_id
            WHERE order_items.order_id=$1`,
            [id]
        );

        res.json({
            order: order.rows[0],
            items: items.rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};