const express = require ("express");
const formidable = require ("express-formidable");
const router = express.Router();

//middleware
const { requireSignin, isAdmin } = require("../Middlewares/auth");

//controllers
const {
    create,
    list,
    read,
    photo,
    remove,
    update,
    filteredProducts,
    productsCount,
    listProducts,
    productsSearch,
    relatedProducts
} = require("../Controllers/product");
const {is} = require("braintree/vendor/querystring.node.js.511d6a2/util");

router.post("/product", requireSignin, isAdmin, formidable(), create);
router.get("/products", list);
router.get("/product/:slug", read);
router.get("/product/photo/:productId", photo)
router.delete("/product/:productId", requireSignin, isAdmin, remove);
router.put("/product/:productId", requireSignin, isAdmin, formidable(), update);
router.post("/filtered-products", filteredProducts);
router.get("/products-count", productsCount);
router.get("/list-products/:page", listProducts);
router.get("/products-search/:keyword", productsSearch);
router.get("/related-products/:productId/:categoryId", relatedProducts);



module.exports = router;