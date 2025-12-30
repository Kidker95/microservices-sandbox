export enum StatusCode {
    OK = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500
}

export enum ServiceName {
    UserService =  "user-service",
    OrderService =  "order-service",
    ProductService =  "product-service",
    ReceiptService =  "receipt-service",
    FortuneService =  "fortune-service",
}

export enum UserRole {
    User = "User",
    Admin = "Admin"
}