# Microservices Sandbox

A Node.js + TypeScript microservices playground for an imaginary skateboard shop.

This repo is for learning and architecture practice, not production use.

## Stack

- Node.js (TypeScript, CommonJS)
- Express 5
- MongoDB + Mongoose (database-per-service)
- nginx as API gateway
- JWT + bcrypt in `auth-service`
- Handlebars + Playwright for receipts/admin views

## Services

| Service | Port | Base Path | Responsibility |
|---|---:|---|---|
| `user-service` | 4001 | `/api/users` | User profiles, addresses, roles |
| `order-service` | 4002 | `/api/orders` | Orders and ownership checks |
| `product-service` | 4003 | `/api/products` | Product catalog and stock |
| `receipt-service` | 4004 | `/api/receipts` | HTML/PDF receipts |
| `admin-service` | 4005 | `/api/admin` | Server-rendered admin dashboard |
| `fortune-service` | 4006 | `/api/fortune` | External fortune API wrapper |
| `auth-service` | 4007 | `/api/auth` | Credentials, login, JWT verify |

## Architecture Notes

- `auth-service` is the source of truth for credentials and token verification.
- Other services verify tokens by calling `auth-service` over HTTP.
- Services do not share databases.
- `@ms/common` contains shared app/bootstrap/http/middleware helpers.

## Gateway

Public entry point:

- `http://localhost:8080`

nginx configs:

- Local services mode: `infra/nginx/nginx.local.conf`
- Docker mode: `infra/nginx/nginx.docker.conf`

Gateway health routes:

- `GET /health`
- `GET /api/users/health`
- `GET /api/orders/health`
- `GET /api/products/health`
- `GET /api/receipts/health`
- `GET /api/admin/health`
- `GET /api/fortune/health`
- `GET /api/auth/health`

## Root Scripts

From `package.json`:

- `npm run dev:all`
- `npm run dev:users`
- `npm run dev:orders`
- `npm run dev:products`
- `npm run dev:receipts`
- `npm run dev:admin`
- `npm run dev:fortune`
- `npm run dev:auth`
- `npm run seed`
- `npm run seed:docker`
- `npm test`
- `npm run nginx:on`
- `npm run nginx:off`
- `npm run nginx:reload`

## Run Locally (Node Processes)

1. Install dependencies:

```bash
npm ci
```

2. Make sure MongoDB is running on `mongodb://localhost:27017`.

3. Start all services:

```bash
npm run dev:all
```

4. Start nginx (Windows script expects nginx at `C:\nginx\nginx-1.28.0\nginx-1.28.0\nginx.exe`):

```bash
npm run nginx:on
```

5. Verify:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/auth/health
curl http://localhost:8080/api/users/health
```

## Run With Docker Compose

1. Build and start:

```bash
docker compose up -d --build
```

2. Public access is only through nginx on `8080`.

3. Optional health check:

```bash
curl http://localhost:8080/health
```

Notes:

- Compose publishes `8080` (nginx) and `27017` (mongo).
- Microservice ports (`4001`-`4007`) are not published.

## Seeding

Seed script: `scripts/seed.ts`

It is auth-aware, safe to rerun, and performs:

1. Health checks
2. Root-admin login/bootstrap
3. Wipe orders/products/users(credentials) with safety checks
4. Recreate users, credentials, products, and orders

### Seed commands

- Local service ports (`localhost:4001/4002/4003/4007`):

```bash
npm run seed
```

- Docker via nginx gateway (`localhost:8080`):

```bash
npm run seed:docker
```

- Optional compose tool profile seed container (runs inside docker network):

```bash
docker compose --profile tools up seed
```

### Seed environment knobs

Supported variables:

- Counts: `SEED_USERS`, `SEED_PRODUCTS`, `SEED_ORDERS`
- Root admin: `SEED_ROOT_ADMIN_EMAIL`, `SEED_ROOT_ADMIN_PASSWORD`
- Mode flags: `SEED_TARGET=docker|gateway`, `SEED_DOCKER`, `SEED_GATEWAY`
- URL overrides:
  - `SEED_USERS_SERVICE_URL`
  - `SEED_ORDERS_SERVICE_URL`
  - `SEED_PRODUCTS_SERVICE_URL`
  - `SEED_AUTH_SERVICE_URL`
- Health URL overrides:
  - `SEED_USERS_HEALTH_URL`
  - `SEED_ORDERS_HEALTH_URL`
  - `SEED_PRODUCTS_HEALTH_URL`
  - `SEED_AUTH_HEALTH_URL`

## Required Env Variables by Service

Use each service's `src/config/env.ts` as source of truth. Core required values:

- `auth-service`:
  - `MONGO_CONNECTION_STRING`
  - `SEED_ROOT_ADMIN_EMAIL`
  - `HASHING_SALT`
  - `PASSWORD_PEPPER`
  - `JWT_SECRET`
  - `USER_SERVICE_BASE_URL`
- `user-service`:
  - `MONGO_CONNECTION_STRING`
  - `SEED_ROOT_ADMIN_EMAIL`
  - `AUTH_SERVICE_BASE_URL`
- `order-service`:
  - `MONGO_CONNECTION_STRING`
  - `USER_SERVICE_BASE_URL`
  - `PRODUCT_SERVICE_BASE_URL`
  - `AUTH_SERVICE_BASE_URL`
- `product-service`:
  - `MONGO_CONNECTION_STRING`
  - `AUTH_SERVICE_BASE_URL`
- `receipt-service`:
  - `USER_SERVICE_BASE_URL`
  - `ORDER_SERVICE_BASE_URL`
  - `PRODUCT_SERVICE_BASE_URL`
  - `FORTUNE_SERVICE_BASE_URL`
  - `AUTH_SERVICE_BASE_URL`
- `admin-service`:
  - `USER_SERVICE_BASE_URL`
  - `ORDER_SERVICE_BASE_URL`
  - `PRODUCT_SERVICE_BASE_URL`
  - `RECEIPT_SERVICE_BASE_URL`
  - `FORTUNE_SERVICE_BASE_URL`
  - `AUTH_SERVICE_BASE_URL`
  - `NGINX_HEALTH_URL`
- `fortune-service`:
  - Optional `FORTUNE_UPSTREAM_BASE_URL`

## Testing

Run all tests:

```bash
npm test
```

Jest config lives in `jest.config.js`, with test setup under `tests/`.

## Repo Layout

```text
.
|-- services/
|   |-- auth-service/
|   |-- user-service/
|   |-- order-service/
|   |-- product-service/
|   |-- receipt-service/
|   |-- admin-service/
|   `-- fortune-service/
|-- packages/
|   `-- ms-common/
|-- infra/
|   `-- nginx/
|       |-- nginx.local.conf
|       `-- nginx.docker.conf
|-- scripts/
|   |-- nginx/
|   `-- seed.ts
|-- tests/
|-- docker-compose.yml
`-- package.json
```
