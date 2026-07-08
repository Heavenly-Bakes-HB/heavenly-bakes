const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Get logged-in user's cart
exports.getCart = async (req, res) => {
    try {

        const userId = req.user.id;

        let cart = await pool.query(
            "SELECT * FROM cart WHERE user_id=$1",
            [userId]
        );

        if (cart.rows.length === 0) {
            return res.json([]);
        }

        const cartId = cart.rows[0].id;

        const items = await pool.query(
            `SELECT
                cart_items.id,
                cart_items.quantity,
                products.id AS product_id,
                products.name,
                products.price,
                products.image_url
            FROM cart_items
            JOIN products
                ON cart_items.product_id = products.id
            WHERE cart_items.cart_id=$1`,
            [cartId]
        );

        res.json(items.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }
};


// Add product to cart
exports.addToCart = async (req, res) => {

    try {

        const userId = req.user.id;

        const { product_id, quantity } = req.body;

        let cart = await pool.query(
            "SELECT * FROM cart WHERE user_id=$1",
            [userId]
        );

        let cartId;

        if (cart.rows.length === 0) {

            cartId = uuidv4();

            await pool.query(
                "INSERT INTO cart(id,user_id) VALUES($1,$2)",
                [cartId, userId]
            );

        } else {

            cartId = cart.rows[0].id;

        }

        const existing = await pool.query(
            `SELECT *
             FROM cart_items
             WHERE cart_id=$1
             AND product_id=$2`,
            [cartId, product_id]
        );

        if (existing.rows.length > 0) {

            await pool.query(
                `UPDATE cart_items
                 SET quantity = quantity + $1
                 WHERE id=$2`,
                [
                    quantity,
                    existing.rows[0].id
                ]
            );

        } else {

            await pool.query(
                `INSERT INTO cart_items
                (id,cart_id,product_id,quantity)
                VALUES($1,$2,$3,$4)`,
                [
                    uuidv4(),
                    cartId,
                    product_id,
                    quantity
                ]
            );

        }

        res.json({
            message: "Added To Cart"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};


// Update quantity
exports.updateCart = async (req, res) => {

    try {

        const { id } = req.params;

        const { quantity } = req.body;

        await pool.query(
            `UPDATE cart_items
             SET quantity=$1
             WHERE id=$2`,
            [quantity, id]
        );

        res.json({
            message: "Cart Updated"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};


// Delete item
exports.deleteCartItem = async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            "DELETE FROM cart_items WHERE id=$1",
            [id]
        );

        res.json({
            message: "Item Removed"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};