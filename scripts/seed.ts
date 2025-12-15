console.log("🌱 Seed script starting... 🌱");

const SEED_USERS = Number(process.env.SEED_USERS ?? 50);
const SEED_PRODUCTS = Number(process.env.SEED_PRODUCTS ?? 120);
const SEED_ORDERS = Number(process.env.SEED_ORDERS ?? 200);


const services = {
    users: "http://localhost:4001",
    orders: "http://localhost:4002",
    products: "http://localhost:4003",
    receipts: "http://localhost:4004"
} as const;

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= H E L P E R S =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

const line = () => console.log("********************\n");

async function fetchWithTimeout(url: string, init: RequestInit, ms = 8000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);

    try { return await fetch(url, { ...init, signal: controller.signal }); }
    finally { clearTimeout(id); }
}

async function checkHealth(name: string, baseUrl: string): Promise<void> {
    const res = await fetchWithTimeout(`${baseUrl}/health`, { method: "GET" }, 4000);

    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

    if (!res.ok) {
        const message = data?.error || `${res.status} ${res.statusText}`;
        throw new Error(`${name} health failed: ${message}`);
    }

    console.log(`${name}:`, data);
}

async function checkAllHealth(): Promise<void> {
    line();
    console.log("Checking services health...");
    const entries = Object.entries(services) as Array<[keyof typeof services, string]>;
    for (const [name, url] of entries) await checkHealth(String(name), url);
    line();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

    if (!res.ok) {
        const message = data?.error || `${res.status} ${res.statusText}`;
        throw new Error(`POST ${url} failed: ${message}`);
    }

    return data as T;
}

async function deleteJson<T>(url: string): Promise<T> {
    const res = await fetchWithTimeout(url, { method: "DELETE" });

    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

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
        passwordHash: `seed-hash-${num}`,
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
    await checkAllHealth();

    console.log("🧹 Wiping existing data...");

    const deletedOrders = await deleteJson<{ deleted: number }>(`${services.orders}/api/orders`);
    console.log("Deleted orders:", deletedOrders.deleted);

    const deletedProducts = await deleteJson<{ deleted: number }>(`${services.products}/api/products`);
    console.log("Deleted products:", deletedProducts.deleted);

    const deletedUsers = await deleteJson<{ deleted: number }>(`${services.users}/api/users`);
    console.log("Deleted users:", deletedUsers.deleted);

    line();
    console.log(`Creating ${SEED_USERS} users...`);

    const createdUsers: any[] = [];

    for (let i = 0; i < SEED_USERS; i++) {
        const payload = createUserPayload(i);
        const created = await postJson<any>(`${services.users}/api/users`, payload);
        createdUsers.push(created);

        if ((i + 1) % 10 === 0) console.log(`✅ Created ${i + 1}/50 users`);
    }

    line();
    console.log("✅ Users done. First user id:", createdUsers[0]?._id);

    line();
    console.log(`Creating ${SEED_PRODUCTS} products...`);

    const createdProducts: any[] = [];
    const productStock = new Map<string, number>();

    for (let i = 0; i < SEED_PRODUCTS; i++) {
        const payload = createProductPayload(i);
        const created = await postJson<any>(`${services.products}/api/products`, payload);
        createdProducts.push(created);
        productStock.set(created._id, created.stock);

        if ((i + 1) % 10 === 0) console.log(`✅ Created ${i + 1}/120 products`);
    }

    line();
    console.log("✅ Products done. First product id:", createdProducts[0]?._id);

    line();
    console.log(`Creating ${SEED_ORDERS} orders...`);

    const createdOrderIds: string[] = [];

    for (let i = 0; i < SEED_ORDERS; i++) {
        const user = sampleOne(createdUsers);

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
        

        // If something weird happened and all items got filtered out, skip this order
        if (items.length === 0) {
            console.log("⚠️ Skipping order: no valid items after stock check");
            continue;
        }

        const payload = {
            userId: user._id,
            items,
            shippingAddress: user.address
        };

        const created = await postJson<any>(`${services.orders}/api/orders`, payload);

        for (const item of items) {
            const left = productStock.get(item.productId) ?? 0;
            productStock.set(item.productId, left - item.quantity);
        }
        

        createdOrderIds.push(created._id);

        if ((i + 1) % 20 === 0) console.log(`✅ Created ${i + 1}/200 orders`);
    }

    line();
    console.log("✅ Orders done. First order id:", createdOrderIds[0]);

    console.log("🌱 Seed script ending... 🌱");
}

main().catch(err => {
    console.error("Seed failed:", err);
    process.exit(1);
});


