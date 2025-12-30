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

export enum Currency {
    ILS = "ILS",
    USD = "USD",
    EUR = "EUR"
}

export enum Size {
    Small = "Small",
    Medium = "Medium",
    Large = "Large",
    Extra_Large = "Extra Large"
}

export enum UserRole {
    User = "User",
    Admin = "Admin"
}