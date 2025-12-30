import { UserRole } from "./enums";

// =-=-=-=-=-=-=-=-= M  O  D  E  L  S =-=-=-=-=-=-=-=-=


export type Address = {
    fullName: string;
    street: string;
    country: string;
    zipCode: string;
    phone?: string
}

export type User = {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
    address: Address;
    createdAt: Date;
    updatedAt: Date;
}



// =-=-=-=-=-=-=-=-= A  U  T  H =-=-=-=-=-=-=-=-=


export type CredentialsModel = {
    email: string;
    password: string
}

export interface TokenUserPayload {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
}

export interface DecodedToken {
    user: TokenUserPayload;
    iat: number;
    exp: number;
}

export type RegisterUserPayload = {
    email: string;
    password: string;
    name: string;
    address: Address;
    role?: UserRole; 
};