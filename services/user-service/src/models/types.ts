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

export type AuthContext = {
    userId: string;
    role: UserRole;
};
