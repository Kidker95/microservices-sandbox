console.log("🌱 Seed script starting... 🌱");

const SEED_USERS = Number(process.env.SEED_USERS ?? 50);
const SEED_PRODUCTS = Number(process.env.SEED_PRODUCTS ?? 120);
const SEED_ORDERS = Number(process.env.SEED_ORDERS ?? 200);

const ROOT_ADMIN_EMAIL = process.env.SEED_ROOT_ADMIN_EMAIL || "seed-root-admin@sandbox.com";
const ROOT_ADMIN_PASSWORD = "SeedRootAdmin!123";

const services = {
    users: "http://localhost:4001",
    orders: "http://localhost:4002",
    products: "http://localhost:4003",
    auth: "http://localhost:4007"
} as const;

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= H E L P E R S =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

const line = () => console.log("********************\n");

async function fetchWithTimeout(url: string, init: RequestInit, ms = 8000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);

    try { return await fetch(url, { ...init, signal: controller.signal }); }
    finally { clearTimeout(id); }
}

async function readJsonSafe(res: Response): Promise<any> {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function checkHealth(name: string, baseUrl: string): Promise<void> {
    const res = await fetchWithTimeout(`${baseUrl}/health`, { method: "GET" }, 4000);
    const data = await readJsonSafe(res);

    if (!res.ok) {
        const message = data?.error || `${res.status} ${res.statusText}`;
        throw new Error(`${name} health failed: ${message}`);
    }

    console.log(`${name}:`, data);
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await readJsonSafe(res);

    if (!res.ok) {
        const message = data?.error || `${res.status} ${res.statusText}`;
        throw new Error(`POST ${url} failed: ${message}`);
    }

    return data as T;
}

async function postJsonAuth<T>(url: string, token: string, body: unknown): Promise<T> {
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    const data = await readJsonSafe(res);

    if (!res.ok) {
        const message = data?.error || `${res.status} ${res.statusText}`;
        throw new Error(`POST ${url} failed: ${message}`);
    }

    return data as T;
}

async function deleteJsonAuth<T>(url: string, token: string, headers: Record<string, string> = {}): Promise<T> {
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            ...headers
        }
    });

    const data = await readJsonSafe(res);

    if (!res.ok) {
        const message = data?.error || `${res.status} ${res.statusText}`;
        throw new Error(`DELETE ${url} failed: ${message}`);
    }

    return data as T;
}

const pad3 = (n: number) => String(n).padStart(3, "0");
const pick = <T>(arr: T[], i: number): T => arr[i % arr.length];

const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const sampleOne = <T>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

const notNull = <T>(v: T | null): v is T => v !== null;


function sampleManyUnique<T>(arr: T[], count: number): T[] {
    const copy = [...arr];
    const result: T[] = [];
    while (result.length < count && copy.length > 0) {
        const idx = randInt(0, copy.length - 1);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= D A T A   F O R   C R E A T I O N =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// Users
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

// Products
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

// Orders
const orderSizes = ["Small", "Medium", "Large", "Extra Large"] as const;
const orderColors = ["Black", "White", "Grey", "Red", "Blue", "Green"] as const;

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= F A C T O R I E S =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

function createUserPayload(i: number) {
    const idx = i + 1;
    const num = pad3(idx);

    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const crew = crewNicknames[i % crewNicknames.length];

    const name = `${first} ${last}`;
    const email = `seed.user.${num}@skateshop.local`;

    return {
        name,
        email,
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
                                type === "Skate Tool" ? "TL" :
                                    "WX";
    return `${code}-${num}`;
}

function createProductPayload(i: number) {
    const type = pick(productTypes, i);
    const brand = pick(brandNames, i);
    const adj = pick(adjectives, i);
    const noun = pick(nouns, i + 3);

    const sku = createSku(type, i);
    const name = `${type} — ${brand} ${adj} ${noun}`;

    const basePrice =
        type === "Deck" ? 249 :
            type === "Trucks" ? 219 :
                type === "Wheels" ? 189 :
                    type === "Bearings" ? 99 :
                        type === "Grip Tape" ? 39 :
                            type === "Hardware" ? 25 :
                                type === "Skate Tool" ? 59 :
                                    19;

    const stock = 5 + ((i * 7) % 40); // 5..44
    const currency = "ILS";

    const colors = ["Black", "White", "Grey", "Red", "Blue", "Green"];

    return {
        sku,
        name,
        description: `${brand} ${type.toLowerCase()} built for street and park. Limited seed edition: ${adj} ${noun}.`,
        price: basePrice + ((i % 5) * 10),
        currency,
        stock,
        isActive: true,
        colors: [pick(colors, i), pick(colors, i + 2)].filter((v, idx, arr) => arr.indexOf(v) === idx),
        sizes: [] as string[]
    };
}

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= M A I N =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

async function main(): Promise<void> {
    line();
    console.log("Checking services health...");
    await checkHealth("user-service", services.users);
    await checkHealth("product-service", services.products);
    await checkHealth("order-service", services.orders);
    await checkHealth("auth-service", services.auth);
    line();

    console.log("Logging in as root admin...");
    const login = await postJson<{ token: string }>(`${services.auth}/api/auth/login`, {
        email: ROOT_ADMIN_EMAIL,
        password: ROOT_ADMIN_PASSWORD
    });
    const adminToken = login.token;
    if (!adminToken) throw new Error("Root admin login failed: missing token");

    console.log("🧹 Wiping existing data...");

    const deletedOrders = await deleteJsonAuth<{ deleted: number }>(`${services.orders}/api/orders`, adminToken);
    console.log("Deleted orders:", deletedOrders.deleted);

    const deletedProducts = await deleteJsonAuth<{ deleted: number }>(`${services.products}/api/products`, adminToken);
    console.log("Deleted products:", deletedProducts.deleted);

    const deletedUsers = await deleteJsonAuth<{ deleted: number }>(
        `${services.users}/api/users/seed-wipe`,
        adminToken,
        { "x-seed-wipe": "true" }
    );
    console.log("Deleted users:", deletedUsers.deleted);

    const deletedCredentials = await deleteJsonAuth<{ deleted: number }>(
        `${services.auth}/api/auth/seed-wipe`,
        adminToken,
        { "x-seed-wipe": "true" }
    );
    console.log("Deleted credentials:", deletedCredentials.deleted);

    line();
    console.log(`Creating ${SEED_USERS} users...`);

    const createdUsers: any[] = [];

    for (let i = 0; i < SEED_USERS; i++) {
        const payload = createUserPayload(i);
        const created = await postJsonAuth<any>(`${services.users}/api/users`, adminToken, payload);
        createdUsers.push({ ...created, seedPassword: `SeedPass!${pad3(i + 1)}` });

        if ((i + 1) % 10 === 0) console.log(`✅ Created ${i + 1}/${SEED_USERS} users`);
    }

    for (const user of createdUsers) {
        await postJson(`${services.auth}/api/auth/register`, {
            email: user.email,
            password: user.seedPassword,
            userId: user._id
        });
    }

    line();
    console.log("✅ Users done. First user id:", createdUsers[0]?._id);

    line();
    console.log(`Creating ${SEED_PRODUCTS} products...`);

    const createdProducts: any[] = [];
    const productStock = new Map<string, number>();

    for (let i = 0; i < SEED_PRODUCTS; i++) {
        const payload = createProductPayload(i);
        const created = await postJsonAuth<any>(`${services.products}/api/products`, adminToken, payload);
        createdProducts.push(created);
        productStock.set(created._id, created.stock);

        if ((i + 1) % 10 === 0) console.log(`✅ Created ${i + 1}/${SEED_PRODUCTS} products`);
    }

    line();
    console.log("✅ Products done. First product id:", createdProducts[0]?._id);

    const loginUsers = createdUsers.slice(0, Math.min(10, createdUsers.length));
    const loggedInUsers: Array<{ user: any; token: string }> = [];

    for (const user of loginUsers) {
        const result = await postJson<{ token: string }>(`${services.auth}/api/auth/login`, {
            email: user.email,
            password: user.seedPassword
        });
        loggedInUsers.push({ user, token: result.token });
    }

    line();
    console.log(`Creating ${SEED_ORDERS} orders...`);

    const createdOrderIds: string[] = [];

    for (let i = 0; i < SEED_ORDERS; i++) {
        const userLogin = sampleOne(loggedInUsers);
        const user = userLogin.user;
        const userToken = userLogin.token;

        const itemsCount = randInt(1, 5);

        const availableProducts = createdProducts.filter(
            p => (productStock.get(p._id) ?? 0) > 0
        );

        if (availableProducts.length === 0) {
            console.log("⚠️ No products with stock left, stopping order creation");
            break;
        }

        const pickedProducts = sampleManyUnique(
            availableProducts,
            Math.min(itemsCount, availableProducts.length)
        );

        const rawItems = pickedProducts.map(p => {
            const availableStock = productStock.get(p._id) ?? 0;
            if (availableStock <= 0) return null;

            const maxQuantity = Math.min(3, availableStock);
            const quantity = randInt(1, maxQuantity);

            const includeSize = Math.random() < 0.35;
            const includeColor = Math.random() < 0.5;

            return {
                productId: p._id,
                quantity,
                ...(includeSize ? { size: sampleOne(orderSizes) } : {}),
                ...(includeColor ? { color: sampleOne(orderColors) } : {})
            };
        });

        const items = rawItems.filter(notNull);

        if (items.length === 0) {
            console.log("⚠️ Skipping order: no valid items after stock check");
            continue;
        }

        const payload = {
            userId: user._id,
            items,
            shippingAddress: user.address
        };

        const created = await postJsonAuth<any>(`${services.orders}/api/orders`, userToken, payload);

        for (const item of items) {
            const left = productStock.get(item.productId) ?? 0;
            productStock.set(item.productId, left - item.quantity);
        }

        createdOrderIds.push(created._id);

        if ((i + 1) % 20 === 0) console.log(`✅ Created ${i + 1}/${SEED_ORDERS} orders`);
    }

    line();
    console.log("✅ Orders done. First order id:", createdOrderIds[0]);

    const rootAdminRes = await fetchWithTimeout(
        `${services.users}/api/users/by-email/${encodeURIComponent(ROOT_ADMIN_EMAIL)}`,
        { method: "GET" }
    );
    const rootAdminData = await readJsonSafe(rootAdminRes);
    if (!rootAdminRes.ok) {
        throw new Error(`Root admin check failed: ${rootAdminData?.error || rootAdminRes.statusText}`);
    }

    line();
    console.log("Seed summary:");
    console.log("Users created:", createdUsers.length);
    console.log("Products created:", createdProducts.length);
    console.log("Orders created:", createdOrderIds.length);
    console.log("Root admin preserved:", rootAdminData?.email || ROOT_ADMIN_EMAIL);

    console.log("🌱 Seed script ending... 🌱");
}

main().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});
