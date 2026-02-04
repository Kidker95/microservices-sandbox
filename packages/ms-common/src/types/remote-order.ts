import { RemoteAddress } from "./remote-address";
import { RemoteOrderItem } from "./remote-order-item";

export type RemoteOrder = {
    _id: string;
    userId: string;
    items: RemoteOrderItem[];
    status: string;         
    subtotal: number;
    shippingCost: number;
    total: number;
    shippingAddress: RemoteAddress;
    createdAt: string | Date;
    updatedAt: string | Date;
};