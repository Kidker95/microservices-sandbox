import { UserRole } from "../enums"
import { Address } from "./address"

export type RemoteUser = {
    _id: string,
    email: string,
    name: string,
    address: Address,
    role: UserRole
}