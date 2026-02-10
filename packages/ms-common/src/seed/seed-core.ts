type SeedProgress = {
    percent: number;
    message: string;
};

type RunSeedOptions = {
    baseUrl: string;
    onProgress: (progress: SeedProgress) => void;
    signal?: AbortSignal;
};

type SeedUser = {
    _id: string;
    email: string;
    name: string;
    address: {
        fullName: string;
        street: string;
        country: string;
        zipCode: string;
        phone?: string;
    };
    seedPassword: string;
};

type SeedProduct = {
    _id: string;
    stock: number;
};

const firstNames = [
    "Omri", "Lee", "Yael", "Noa", "Maya", "Itay", "Tom", "Lior", "Gal", "Nadav",
    "Amit", "Eden", "Shaked", "Daniel", "Ariel", "Yonatan", "Shahar", "Roni"
];

const lastNames = [
    "Shachar", "Cohen", "Levi", "Mizrahi", "Biton", "Dahan", "Peretz", "Azoulay",
    "Friedman", "Katz", "Gross", "Ben-David", "Ohayon", "Sharon"
];

const crewNicknames = [
    "Concrete", "Curb", "Kickflip", "Nollie", "Grind", "Slappy", "Ramps", "Rails",
    "Bowl", "Stairs", "Asphalt", "Ledge", "Vans", "Indy"
];

const brandNames = [
    "Indy", "Thunder", "Spitfire", "Bones", "Santa Cruz", "Toy Machine",
    "Girl", "Chocolate", "Baker", "Antihero", "Element", "Real"
];

const productTypes = [
    "Deck", "Wheels", "Trucks", "Bearings", "Grip Tape", "Hardware", "Skate Tool", "Wax"
];

const adjectives = [
    "Concrete", "Asphalt", "Rust", "Neon", "Steel", "Midnight", "Sunset", "Curbside",
    "Phantom", "Static", "Grimy", "Clean", "Shattered", "Bowl"
];

const nouns = [
    "Ghost", "Lizard", "Wolf", "Crow", "Golem", "Cobra", "Satellite", "Comet",
    "Riot", "Drifter", "Echo", "Vandal", "Hawk", "Mirage"
];

const orderSizes = ["Small", "Medium", "Large", "Extra Large"] as const;
const orderColors = ["Black", "White", "Grey", "Red", "Blue", "Green"] as const;

function normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.replace(/\/+$/, "");
}

function ensureNotAborted(signal?: AbortSignal): void {
    if (signal?.aborted) throw new Error("Seed aborted");
}

async function fetchWithTimeout(url: string, init: RequestInit, signal?: AbortSignal, ms = 12000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    const handleAbort = () => controller.abort();
    signal?.addEventListener("abort", handleAbort, { once: true });

    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener("abort", handleAbort);
    }
}

async function readJsonSafe(res: Response): Promise<any> {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function requestJson<T>(url: string, init: RequestInit, signal?: AbortSignal): Promise<T> {
    const res = await fetchWithTimeout(url, init, signal);
    const data = await readJsonSafe(res);

    if (!res.ok) {
        const message = data?.error || `${res.status} ${res.statusText}`;
        const details = data?.details ? ` (details: ${data.details})` : "";
        const dependency = data?.dependency ? ` (dependency: ${data.dependency})` : "";
        throw new Error(`${init.method || "GET"} ${url} failed: ${message}${details}${dependency}`);
    }

    return data as T;
}

function pad3(n: number): string { return String(n).padStart(3, "0"); }
function pick<T>(arr: readonly T[], i: number): T { return arr[i % arr.length] as T; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sampleOne<T>(arr: readonly T[]): T { return arr[randInt(0, arr.length - 1)] as T; }

function sampleManyUnique<T>(arr: T[], count: number): T[] {
    const copy = [...arr];
    const out: T[] = [];
    while (out.length < count && copy.length > 0) {
        const idx = randInt(0, copy.length - 1);
        out.push(copy.splice(idx, 1)[0] as T);
    }
    return out;
}

function createUserPayload(i: number) {
    const idx = i + 1;
    const num = pad3(idx);
    const first = pick(firstNames, i);
    const last = pick(lastNames, i);
    const crew = pick(crewNicknames, i);
    const name = `${first} ${last}`;

    return {
        name,
        email: `seed.user.${num}@skateshop.local`,
        address: {
            fullName: name,
            street: `${idx} ${crew} Street`,
            country: "Israel",
            zipCode: `10${num}`,
            phone: `050-000${num}`
        }
    };
}

function createSku(type: string, i: number): string {
    const num = pad3(i + 1);
    const code =
        type === "Deck" ? "DK" :
            type === "Wheels" ? "WH" :
                type === "Trucks" ? "TR" :
                    type === "Bearings" ? "BR" :
                        type === "Grip Tape" ? "GR" :
                            type === "Hardware" ? "HW" :
                                type === "Skate Tool" ? "TL" : "WX";
    return `${code}-${num}`;
}

function createProductPayload(i: number) {
    const type = pick(productTypes, i);
    const brand = pick(brandNames, i);
    const adj = pick(adjectives, i);
    const noun = pick(nouns, i + 3);

    const basePrice =
        type === "Deck" ? 249 :
            type === "Trucks" ? 219 :
                type === "Wheels" ? 189 :
                    type === "Bearings" ? 99 :
                        type === "Grip Tape" ? 39 :
                            type === "Hardware" ? 25 :
                                type === "Skate Tool" ? 59 : 19;

    const colors = ["Black", "White", "Grey", "Red", "Blue", "Green"];
    const colorA = pick(colors, i);
    const colorB = pick(colors, i + 2);

    return {
        sku: createSku(type, i),
        name: `${type} - ${brand} ${adj} ${noun}`,
        description: `${brand} ${type.toLowerCase()} built for street and park. Limited seed edition: ${adj} ${noun}.`,
        price: basePrice + ((i % 5) * 10),
        currency: "ILS",
        stock: 5 + ((i * 7) % 40),
        isActive: true,
        colors: [colorA, colorB].filter((v, idx, arr) => arr.indexOf(v) === idx),
        sizes: [] as string[]
    };
}

function progressEmitter(onProgress: (progress: SeedProgress) => void) {
    return (percent: number, message: string) => onProgress({ percent: Math.max(0, Math.min(100, percent)), message });
}

export async function runSeed(options: RunSeedOptions): Promise<void> {
    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const emit = progressEmitter(options.onProgress);

    const seedUsers = Number(process.env.SEED_USERS ?? 50);
    const seedProducts = Number(process.env.SEED_PRODUCTS ?? 120);
    const seedOrders = Number(process.env.SEED_ORDERS ?? 200);
    const rootAdminEmail = process.env.SEED_ROOT_ADMIN_EMAIL || "seed-root-admin@sandbox.com";
    const rootAdminPassword = process.env.SEED_ROOT_ADMIN_PASSWORD || "SeedRootAdmin!123";

    emit(1, "Starting seed");
    ensureNotAborted(options.signal);

    const healthTargets = [
        { name: "users", url: `${baseUrl}/api/users/health` },
        { name: "products", url: `${baseUrl}/api/products/health` },
        { name: "orders", url: `${baseUrl}/api/orders/health` },
        { name: "auth", url: `${baseUrl}/api/auth/health` }
    ];

    emit(5, "Checking service health");
    for (const target of healthTargets) {
        ensureNotAborted(options.signal);
        await requestJson(target.url, { method: "GET" }, options.signal);
    }

    emit(10, "Logging in as root admin");
    let login: { token: string };
    try {
        login = await requestJson<{ token: string }>(
            `${baseUrl}/api/auth/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: rootAdminEmail, password: rootAdminPassword })
            },
            options.signal
        );
    } catch {
        emit(12, "Bootstrapping root admin");
        let rootAdminUser: any = null;
        try {
            rootAdminUser = await requestJson(
                `${baseUrl}/api/users/by-email/${encodeURIComponent(rootAdminEmail)}`,
                { method: "GET" },
                options.signal
            );
        } catch {
            rootAdminUser = await requestJson(
                `${baseUrl}/api/users`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: rootAdminEmail,
                        name: "Root Admin",
                        role: "Admin",
                        address: {
                            fullName: "Root Admin",
                            street: "1 Admin Street",
                            country: "Israel",
                            zipCode: "00000",
                            phone: "000-0000000"
                        }
                    })
                },
                options.signal
            );
        }

        await requestJson(
            `${baseUrl}/api/auth/register`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: rootAdminEmail,
                    password: rootAdminPassword,
                    userId: rootAdminUser._id
                })
            },
            options.signal
        );

        login = await requestJson<{ token: string }>(
            `${baseUrl}/api/auth/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: rootAdminEmail, password: rootAdminPassword })
            },
            options.signal
        );
    }

    const adminToken = login.token;
    if (!adminToken) throw new Error("Root admin login failed: missing token");
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    emit(16, "Wiping orders");
    await requestJson(`${baseUrl}/api/orders`, { method: "DELETE", headers: authHeaders }, options.signal);

    emit(20, "Wiping products");
    await requestJson(`${baseUrl}/api/products`, { method: "DELETE", headers: authHeaders }, options.signal);

    emit(24, "Wiping users");
    await requestJson(
        `${baseUrl}/api/users/seed-wipe`,
        { method: "DELETE", headers: { ...authHeaders, "x-seed-wipe": "true" } },
        options.signal
    );

    emit(28, "Wiping credentials");
    await requestJson(
        `${baseUrl}/api/auth/seed-wipe`,
        { method: "DELETE", headers: { ...authHeaders, "x-seed-wipe": "true" } },
        options.signal
    );

    emit(32, `Seeding ${seedUsers} users`);
    const createdUsers: SeedUser[] = [];
    for (let i = 0; i < seedUsers; i++) {
        ensureNotAborted(options.signal);
        const created = await requestJson<any>(
            `${baseUrl}/api/users`,
            {
                method: "POST",
                headers: { ...authHeaders, "Content-Type": "application/json" },
                body: JSON.stringify(createUserPayload(i))
            },
            options.signal
        );
        createdUsers.push({
            ...created,
            seedPassword: `SeedPass!${pad3(i + 1)}`
        } as SeedUser);

        const percent = 32 + Math.floor(((i + 1) / Math.max(seedUsers, 1)) * 12);
        emit(percent, `Seeding users (${i + 1}/${seedUsers})`);
    }

    emit(44, "Seeding user credentials");
    for (let i = 0; i < createdUsers.length; i++) {
        ensureNotAborted(options.signal);
        const user = createdUsers[i] as SeedUser;
        await requestJson(
            `${baseUrl}/api/auth/register`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    password: user.seedPassword,
                    userId: user._id
                })
            },
            options.signal
        );
    }

    emit(50, `Seeding ${seedProducts} products`);
    const createdProducts: SeedProduct[] = [];
    const productStock = new Map<string, number>();
    for (let i = 0; i < seedProducts; i++) {
        ensureNotAborted(options.signal);
        const created = await requestJson<any>(
            `${baseUrl}/api/products`,
            {
                method: "POST",
                headers: { ...authHeaders, "Content-Type": "application/json" },
                body: JSON.stringify(createProductPayload(i))
            },
            options.signal
        );

        createdProducts.push({ _id: created._id, stock: created.stock });
        productStock.set(created._id, created.stock);

        const percent = 50 + Math.floor(((i + 1) / Math.max(seedProducts, 1)) * 18);
        emit(percent, `Seeding products (${i + 1}/${seedProducts})`);
    }

    emit(68, "Preparing user sessions for orders");
    const loginUsers = createdUsers.slice(0, Math.min(10, createdUsers.length));
    const loggedInUsers: Array<{ user: SeedUser; token: string; }> = [];
    for (let i = 0; i < loginUsers.length; i++) {
        ensureNotAborted(options.signal);
        const user = loginUsers[i] as SeedUser;
        const result = await requestJson<{ token: string }>(
            `${baseUrl}/api/auth/login`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email, password: user.seedPassword })
            },
            options.signal
        );
        loggedInUsers.push({ user, token: result.token });
    }

    emit(72, `Seeding ${seedOrders} orders`);
    for (let i = 0; i < seedOrders; i++) {
        ensureNotAborted(options.signal);
        const userLogin = sampleOne(loggedInUsers);

        const availableProducts = createdProducts.filter(p => (productStock.get(p._id) ?? 0) > 0);
        if (availableProducts.length === 0) break;

        const itemsCount = randInt(1, 5);
        const pickedProducts = sampleManyUnique(availableProducts, Math.min(itemsCount, availableProducts.length));

        const items = pickedProducts
            .map(product => {
                const availableStock = productStock.get(product._id) ?? 0;
                if (availableStock <= 0) return null;
                const quantity = randInt(1, Math.min(3, availableStock));
                return {
                    productId: product._id,
                    quantity,
                    ...(Math.random() < 0.35 ? { size: sampleOne(orderSizes) } : {}),
                    ...(Math.random() < 0.5 ? { color: sampleOne(orderColors) } : {})
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);

        if (items.length === 0) continue;

        await requestJson(
            `${baseUrl}/api/orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userLogin.token}`
                },
                body: JSON.stringify({
                    items,
                    shippingAddress: userLogin.user.address
                })
            },
            options.signal
        );

        for (const item of items) {
            const left = productStock.get(item.productId) ?? 0;
            productStock.set(item.productId, left - item.quantity);
        }

        const percent = 72 + Math.floor(((i + 1) / Math.max(seedOrders, 1)) * 27);
        emit(percent, `Seeding orders (${i + 1}/${seedOrders})`);
    }

    emit(100, "Seed completed");
}

export type { RunSeedOptions, SeedProgress };
