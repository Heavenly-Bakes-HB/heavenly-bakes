const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const app = express();

const productRoutes = require("./routes/product.routes");

const cartRoutes = require("./routes/cart.routes");

const orderRoutes = require("./routes/order.routes");

const adminRoutes = require("./routes/admin.routes");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Heavenly Bakes API Running 🚀"
    });
});

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/admin", adminRoutes);

module.exports = app;