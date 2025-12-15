import express from "express";
import { productController } from "../controllers/product-controller";


export const productRouter = express.Router();

// GET

productRouter.get("/",productController.getAllProducts.bind(productController));
productRouter.get("/:_id",productController.getProductById.bind(productController));

// POST

productRouter.post("/",productController.addProduct.bind(productController));

// PUT

productRouter.put("/:_id",productController.updateProduct.bind(productController));

// PATCH

productRouter.patch("/:_id/stock",productController.adjustStock.bind(productController));
productRouter.patch("/:_id/active",productController.adjustActive.bind(productController));


// DELETE

productRouter.delete("/:_id",productController.deleteProduct.bind(productController));
productRouter.delete("/",productController.deleteAll.bind(productController));