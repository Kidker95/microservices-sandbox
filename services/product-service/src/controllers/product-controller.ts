import { NextFunction, Request, Response } from "express";
import { productService } from "../services/product-service";
import { StatusCode } from "@ms/common/enums";
import { Product } from "../models/types";


class ProductController {
    public async getAllProducts(req: Request, res: Response, next: NextFunction) {
        try { return res.json(await productService.getAllProducts()); }
        catch (err) { next(err); }
    }

    public async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing product _id" });

            const product = await productService.getProductById(_id as string);
            return res.json(product);
        } catch (err) { next(err); }
    }

    public async addProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const productPayload = req.body as Omit<Product, "_id" | "createdAt" | "updatedAt">;
            return res.status(StatusCode.Created).json(await productService.addProduct(productPayload));

        } catch (err) { next(err); }
    }

    public async updateProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing product _id" });

            const updatedData = req.body as Partial<Omit<Product, "_id" | "createdAt" | "updatedAt">>;
            return res.json(await productService.updateProduct(_id as string, updatedData));

        } catch (err) { next(err); }
    }

    public async deleteProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing product _id" });
            await productService.deleteProduct(_id as string);
            return res.status(StatusCode.Ok).json({ info: `deleted successfully` });
        } catch (err) { next(err); }
    }

    public async deleteAll(req: Request, res: Response, next: NextFunction) {
        try {
            const deletedCount = await productService.deleteAll();
            return res.status(StatusCode.Ok).json({ deleted: deletedCount });

        } catch (err) { next(err); }
    }

    public async adjustStock(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing product _id" });

            const { delta } = req.body;
            if (typeof delta !== "number") return res.status(StatusCode.BadRequest).json({ error: "missing or invalid delta" });


            return res.json(await productService.adjustStock(_id as string, delta));

        } catch (err) { next(err); }
    }

    public async adjustActive(req: Request, res: Response, next: NextFunction) {
        try {
            const _id = req.params._id;
            if (!_id) return res.status(StatusCode.BadRequest).json({ error: "missing product _id" });
            return res.json(await productService.adjustIsActive(_id as string));

        } catch (err) { next(err); }
    }



}
export const productController = new ProductController();