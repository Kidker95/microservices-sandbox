import { env } from "../config/env";
import { ServiceName } from "../models/enums";
import { BasicService, ServiceStatus } from "../models/types";

class HealthClient {

    private readonly timeoutMs: number = 1500;

    private healthRoutes: BasicService[] = [
        { name: ServiceName.UserService, baseUrl: env.userServiceBaseUrl },
        { name: ServiceName.OrderService, baseUrl: env.orderServiceBaseUrl },
        { name: ServiceName.ProductService, baseUrl: env.productServiceBaseUrl },
        { name: ServiceName.ReceiptService, baseUrl: env.receiptServiceBaseUrl },
    ];

    private async checkOne(service: BasicService): Promise<ServiceStatus> {
        const checkedAt = new Date().toISOString();
        const start = Date.now();
    
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    
        try {
            const response = await fetch(`${service.baseUrl}/health`, { signal: controller.signal });
            const responseTimeMs = Date.now() - start;
    
            let data: any = null;
            try { data = await response.json(); } catch { data = null; }
    
            if (!response.ok) {
                return {
                    name: service.name,
                    baseUrl: service.baseUrl,
                    ok: false,
                    statusCode: response.status,
                    responseTimeMs,
                    error: data?.error || `${response.status} ${response.statusText}`,
                    checkedAt
                };
            }
    
            return {
                name: service.name,
                baseUrl: service.baseUrl,
                ok: true,
                statusCode: response.status,
                responseTimeMs,
                uptimeSeconds: typeof data?.uptimeSeconds === "number" ? data.uptimeSeconds : undefined,
                checkedAt
            };
        } catch (err: any) {
            const responseTimeMs = Date.now() - start;
    
            const isTimeout =
                err?.name === "AbortError" ||
                String(err?.message || "").toLowerCase().includes("aborted");
    
            return {
                name: service.name,
                baseUrl: service.baseUrl,
                ok: false,
                responseTimeMs,
                error: isTimeout ? "timeout" : (err?.message || "fetch failed"),
                checkedAt
            };
        } finally {
            clearTimeout(timeoutId);
        }
    }
    

    public async healthCheck(): Promise<ServiceStatus[]> {
        return Promise.all(this.healthRoutes.map(service => this.checkOne(service)));
    }
}

export const healthClient = new HealthClient();
