import { UserRole } from "./enums";

export type Credentials = {
    _id: string;
    email: string;
    passwordHash: string;
    userId: string;
}

export type CredentialsInput = {
    email: string;
    password: string;
};

export type RemoteUser = {
    _id: string;
    email: string;
    role: UserRole;
};


export type AuthContext = {
    userId: string;
    role: UserRole;
};

export type AddressInput = {
    fullName: string;
    street: string;
    country: string;
    zipCode: string;
    phone: string;
};

export type RegisterInput = {
    email: string;
    password: string;
    name: string;
    address: AddressInput;
};

