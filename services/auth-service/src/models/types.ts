
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
    name?: string;
    address?: AddressInput;
    userId?: string;
};
