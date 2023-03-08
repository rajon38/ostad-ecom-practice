const express = require("express");

const router = express.Router();

const { requireSignin, isAdmin } = require("../Middlewares/auth");

const { create,
    update,
    remove,
    list,
    read,
    productByCategory } = require("../Controllers/category");

router.post("/category", requireSignin, isAdmin, create);
router.put("/category/:categoryId", requireSignin, isAdmin, update);
router.delete("/category/:categoryId", requireSignin, isAdmin, remove);
router.get("/categories", list);
router.get("/category/:slug", read);
router.get("/product-by-category/:slug", productByCategory);


module.exports = router;