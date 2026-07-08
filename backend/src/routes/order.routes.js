const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");

const {
    checkout,
    getOrders,
    getOrder
} = require("../controllers/order.controller");

router.post("/checkout", auth, checkout);

router.get("/", auth, getOrders);

router.get("/:id", auth, getOrder);

module.exports = router;