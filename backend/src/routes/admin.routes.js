const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
    getAllOrders,
    updateOrderStatus,
    getOrder
} = require("../controllers/order.controller");

router.get("/orders", auth, admin, getAllOrders);
router.put("/orders/:id/status", auth, admin, updateOrderStatus);
router.get("/orders/:id", auth, admin, getOrder);

module.exports = router;
