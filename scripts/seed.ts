import { runSeed } from "./seed-core";

function resolveBaseUrl(): string {
    const cliDocker = process.argv.includes("--docker");
    const cliGateway = process.argv.includes("--gateway");

    const envTarget = (process.env.SEED_TARGET || "").toLowerCase();
    const envDocker = process.env.SEED_DOCKER === "1" || process.env.SEED_DOCKER?.toLowerCase() === "true";
    const envGateway = process.env.SEED_GATEWAY === "1" || process.env.SEED_GATEWAY?.toLowerCase() === "true";

    if (process.env.GATEWAY_BASE_URL) return process.env.GATEWAY_BASE_URL;
    if (cliDocker || envDocker || envTarget === "docker") return "http://nginx:8080";
    if (cliGateway || envGateway || envTarget === "gateway") return "http://localhost:8080";
    return "http://localhost:8080";
}

async function main(): Promise<void> {
    const baseUrl = resolveBaseUrl();
    console.log(`Seed starting against gateway: ${baseUrl}`);

    await runSeed({
        baseUrl,
        onProgress: ({ percent, message }) => {
            const pct = String(percent).padStart(3, " ");
            console.log(`[${pct}%] ${message}`);
        }
    });

    console.log("Seed finished.");
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
