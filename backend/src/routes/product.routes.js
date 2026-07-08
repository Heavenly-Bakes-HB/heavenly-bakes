const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/product.controller");

router.get("/", getProducts);

router.get("/:id", getProduct);

router.post("/", auth, admin, createProduct);

router.put("/:id", auth, admin, updateProduct);

router.delete("/:id", auth, admin, deleteProduct);

module.exports = router;