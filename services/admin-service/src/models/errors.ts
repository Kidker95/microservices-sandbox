import { StatusCode } from "./enums";

export abstract class ClientError {
    protected constructor(public status: StatusCode, public message: string) {}
}

export class BadRequestError extends ClientError {
    public constructor(message: string) {
        super(StatusCode.BadRequest, message);
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
