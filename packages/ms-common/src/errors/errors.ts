import { StatusCode } from "../enums/status-code";

export class ClientError extends Error {
  public readonly statusCode: StatusCode;
  public readonly isOperational = true;

  public constructor(message: string, statusCode: StatusCode) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends ClientError {
  public constructor(message: string) { super(message, StatusCode.BadRequest); }
}

export class UnauthorizedError extends ClientError {
  public constructor(message: string) { super(message, StatusCode.Unauthorized); }
}

export class ForbiddenError extends ClientError {
  public constructor(message: string) { super(message, StatusCode.Forbidden); }
}

export class NotFoundError extends ClientError {
  public constructor(message: string) { super(message, StatusCode.NotFound); }
}

export class ServiceUnavailableError extends ClientError {
  public constructor(message: string) { super(message, StatusCode.ServiceUnavailable); }
}
