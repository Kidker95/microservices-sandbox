import { Document } from "mongoose";
import { StatusCode } from "./enums";


export abstract class ClientError {
    protected constructor(public status: StatusCode, public message: string) { }
}

export class BadRequestError extends ClientError {
    public constructor(message: string) {
        super(StatusCode.BadRequest, message);
    }

    public static validateSync(document: Document): void {
        const error = document.validateSync();
        if (error) throw new BadRequestError(error.message);
    }
}

export class UnauthorizedError extends ClientError {
    public constructor(message: string) {
        super(StatusCode.Unauthorized, message);
    }
}

export class ForbiddenError extends ClientError {
    public constructor(message: string) {
        super(StatusCode.Forbidden, message);
    }
}

export class NotFoundError extends ClientError {
    public constructor(message: string) {
        super(StatusCode.NotFound, message);
    }
}

export class ServiceUnavailableError extends ClientError {
    public constructor(message: string) {
        super(StatusCode.ServiceUnavailable, message);
    }
}