import { RemoteUser, ServiceStatus } from "@ms/common/types";
import { healthClient } from "../clients/health-client";
import { ordersClient } from "../clients/orders-client";
import { usersClient } from "../clients/users-client";
import { seedJob } from "../jobs/seed-job";
import { DashboardOrderRow, DashboardViewModel } from "../models/types";

class AdminService {

    private formatShippingSummary(order: any): string {
        const address = order?.shippingAddress;
        if (!address) return "Unknown";

        const parts = [address.fullName, address.street, address.country, address.zipCode]
            .map((p) => String(p || "").trim())
            .filter(Boolean);

        return parts.length > 0 ? parts.join(", ") : "Unknown";
    }

    private formatOrderTotal(order: any): string {
        const amount = typeof order?.total === "number" ? order.total : 0;
        const currency = order?.items?.[0]?.currency || "ILS";

        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
                currencyDisplay: "symbol"
            }).format(amount);
        } catch {
            return `${currency} ${amount.toFixed(2)}`;
        }
    }

    private async buildOrders(token: string): Promise<{ orders: DashboardOrderRow[]; ordersError?: string; }> {
        try {
            const orders = await ordersClient.getAllOrders(token);
            const userIds = [...new Set(orders.map((order) => order.userId))];

            const userEntries = await Promise.all(userIds.map(async (userId) => {
                try {
                    const user = await usersClient.getUserById(userId, token);
                    return [userId, user] as const;
                } catch {
                    return [userId, null] as const;
                }
            }));

            const userMap = new Map<string, RemoteUser | null>(userEntries);

            const rows: DashboardOrderRow[] = orders.map((order) => {
                const user = userMap.get(order.userId);
                return {
                    orderId: order._id,
                    userName: user?.name || "Unknown",
                    userEmail: user?.email || "Unknown",
                    shippingSummary: this.formatShippingSummary(order),
                    total: this.formatOrderTotal(order)
                };
            });

            return { orders: rows };
        } catch (err: any) {
            return {
                orders: [],
                ordersError: err?.message || "Failed to load orders"
            };
        }
    }

    public async getDashboard(token?: string): Promise<DashboardViewModel> {
        const services: ServiceStatus[] = await healthClient.healthCheck();

        const up = services.filter(s => s.ok).length;
        const down = services.length - up;
        const ordersResult = token ? await this.buildOrders(token) : { orders: [], ordersError: "Missing admin token" };

        return {
            generatedAt: new Date().toISOString(),
            services,
            orders: ordersResult.orders,
            ...(ordersResult.ordersError ? { ordersError: ordersResult.ordersError } : {}),
            seedJob: seedJob.getStatus(),
            summary: {
                total: services.length,
                up,
                down
            }
        };
    }
}

export const adminService = new AdminService();
