import { BadRequestError } from "../errors/errors";

export function isMongoObjectId(id: string): boolean {
    return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
}


export function assertMongoObjectId(id: string, fieldName = "id"): void {
    if (!isMongoObjectId(id)) throw new BadRequestError(`Invalid ${fieldName}`);
}
