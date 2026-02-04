import { UserRole } from "@ms/common/enums";
import {Address} from "@ms/common/types"

export type User = {
    _id: string;
    email: string;
    name: string;
    role: UserRole;
    address: Address;
    createdAt: Date;
    updatedAt: Date;
}
