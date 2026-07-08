const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.getProducts = async (req, res) => {
    try {
        const products = await pool.query(
            "SELECT * FROM products ORDER BY created_at DESC"
        );

        res.json(products.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }
};

exports.getProduct = async (req, res) => {

    try {

        const { id } = req.params;

        const product = await pool.query(
            "SELECT * FROM products WHERE id=$1",
            [id]
        );

        if (product.rows.length === 0) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        res.json(product.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

exports.createProduct = async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            stock,
            image_url,
            discount_percent,
            discount_enabled,
            is_trending
        } = req.body;

        await pool.query(
            `INSERT INTO products
            (id,name,description,price,stock,image_url,discount_percent,discount_enabled,is_trending)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
                uuidv4(),
                name,
                description,
                price,
                stock,
                image_url,
                discount_percent ?? 0,
                discount_enabled ?? false,
                is_trending ?? false
            ]
        );

        res.status(201).json({
            message: "Product Created"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

exports.updateProduct = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            description,
            price,
            stock,
            image_url,
            discount_percent,
            discount_enabled,
            is_trending
        } = req.body;

        await pool.query(
            `UPDATE products
             SET name=$1,
                 description=$2,
                 price=$3,
                 stock=$4,
                 image_url=$5,
                 discount_percent=$6,
                 discount_enabled=$7,
                 is_trending=$8,
                 updated_at=CURRENT_TIMESTAMP
             WHERE id=$9`,
            [
                name,
                description,
                price,
                stock,
                image_url,
                discount_percent ?? 0,
                discount_enabled ?? false,
                is_trending ?? false,
                id
            ]
        );

        res.json({
            message: "Product Updated"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

exports.deleteProduct = async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            "DELETE FROM products WHERE id=$1",
            [id]
        );

        res.json({
            message: "Product Deleted"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

};