import mongoose from "mongoose";
import { BadRequestError, NotFoundError } from "../models/errors";
import { ProductDocument, ProductModel } from "../models/product-model";
import { Product } from "../models/types";

class ProductService {

    private toggle(bool: boolean): boolean { return !bool; }

    private validateId(_id: string): void {
        const isValid = mongoose.isValidObjectId(_id);
        if (!isValid) throw new BadRequestError(`_id ${_id} is invalid`);
    }

    public async getAllProducts(): Promise<ProductDocument[]> { return await ProductModel.find().exec(); }

    public async getProductById(_id: string): Promise<ProductDocument> {
        this.validateId(_id);

        const product = await ProductModel.findById(_id).exec();
        if (!product) throw new NotFoundError(`Product with _id ${_id} was not found`);
        return product;
    }

    public async addProduct(product: Omit<Product, "_id" | "createdAt" | "updatedAt">): Promise<ProductDocument> {
        const productDoc = new ProductModel(product);
        BadRequestError.validateSync(productDoc);
        await productDoc.save();
        const dbProduct = await this.getProductById(productDoc._id.toString());
        return dbProduct;

    }

    public async updateProduct(_id: string, product: Partial<Omit<Product, "_id" | "createdAt" | "updatedAt">>): Promise<ProductDocument> {
        this.validateId(_id);

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            _id,
            product,
            { new: true, runValidators: true }
        ).exec();

        if (!updatedProduct) throw new NotFoundError(`Product with _id ${_id} not found`);
        return updatedProduct;
    }

    public async deleteProduct(_id: string): Promise<void> {
        this.validateId(_id);
        const deleted = await ProductModel.findByIdAndDelete(_id);
        if (!deleted) throw new NotFoundError(`Product with id ${_id} not found`);

    }

    public async adjustStock(_id: string, delta: number): Promise<ProductDocument> {
        this.validateId(_id);
    
        const minStock = delta < 0 ? Math.abs(delta) : 0;
    
        const updated = await ProductModel.findOneAndUpdate(
            {
                _id,
                stock: { $gte: minStock } 
            },
            {
                $inc: { stock: delta }
            },
            { new: true, runValidators: true }
        ).exec();
    
        if (!updated) {
            throw new BadRequestError(`Not enough stock or product with _id ${_id} not found`);
        }
    
        return updated;
    }
    

    public async adjustIsActive(_id: string): Promise<ProductDocument> {
        this.validateId(_id);
    
        const product = await ProductModel.findById(_id).exec();
        if (!product) throw new NotFoundError(`Product with _id ${_id} not found`);
    
        product.isActive = this.toggle(product.isActive);
        await product.save();
    
        return product;
    }
    
    
}

export const productService = new ProductService();