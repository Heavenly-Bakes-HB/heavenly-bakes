const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

exports.register = async (req, res) => {
    try {

        const {
            first_name,
            last_name,
            email,
            password,
            phone
        } = req.body;

        if (!first_name || !email || !password) {
            return res.status(400).json({
                message: "Required fields missing"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users
            (id, first_name, last_name, email, password_hash, phone)
            VALUES ($1,$2,$3,$4,$5,$6)`,
            [
                uuidv4(),
                first_name,
                last_name || null,
                email,
                hashedPassword,
                phone || null
            ]
        );

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }
};

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const valid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!valid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        res.json({
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal server error"
        });

    }

};