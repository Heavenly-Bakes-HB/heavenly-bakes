const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");

const {
    getCart,
    addToCart,
    updateCart,
    deleteCartItem
} = require("../controllers/cart.controller");

router.get("/", auth, getCart);

router.post("/", auth, addToCart);

router.put("/:id", auth, updateCart);

router.delete("/:id", auth, deleteCartItem);

module.exports = router;