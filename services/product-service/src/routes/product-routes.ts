import express from "express";
import { productController } from "../controllers/product-controller";
import { securityMiddleware } from "@ms/common/middleware";
import { AuthClient } from "@ms/common/clients";
import { env } from "../config/env";
const authClient = new AuthClient(env.authServiceBaseUrl);
const verifyToken = securityMiddleware.createVerifyToken(authClient);




export const productRouter = express.Router();

// GET

// all products
productRouter.get("/",productController.getAllProducts.bind(productController));

// specific product
productRouter.get("/:_id",productController.getProductById.bind(productController));

// POST

productRouter.post("/", // add product
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    productController.addProduct.bind(productController));

// PUT

productRouter.put("/:_id", // update product
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    productController.updateProduct.bind(productController));

// PATCH

productRouter.patch("/:_id/stock", // adjust stock
    verifyToken,
    productController.adjustStock.bind(productController));

productRouter.patch("/:_id/active", // toggle active/inactive
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    productController.adjustActive.bind(productController));


// DELETE

productRouter.delete("/:_id", // delete specific
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    productController.deleteProduct.bind(productController));

productRouter.delete("/", //delete all
    verifyToken,
    securityMiddleware.verifyAdmin.bind(securityMiddleware),
    productController.deleteAll.bind(productController));