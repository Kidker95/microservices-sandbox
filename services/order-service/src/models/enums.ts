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

export enum OrderStatus {
    Pending = "Pending",
    Paid = "Paid",
    Shipped = "Shipped",
    Cancelled = "Cancelled"
}

export enum Currency {
    ILS = "ILS",
    USD = "USD",
    EUR = "EUR"
}