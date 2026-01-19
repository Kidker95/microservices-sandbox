

# Microservices Sandbox

This repository is a **Node.js + TypeScript microservices playground** for an imaginary skateboard shop.
It is built for **learning, experimentation, and architecture practice** — not production.

The project focuses on:

* Clear service boundaries
* Auth-aware APIs
* Safe seeding and data resets
* HTTP-only inter-service communication
* A simple nginx gateway

---

## Overview

### Tech stack

* **Runtime**: Node.js (TypeScript, CommonJS)
* **Framework**: Express 5
* **Database**: MongoDB (via Mongoose, one DB per service)
* **Reverse proxy**: nginx (local Windows install)
* **Auth**: JWT + bcrypt
* **Templating / PDF**: Handlebars + Playwright

---

## Services

| Service             | Port | Responsibility                                 |
| ------------------- | ---- | ---------------------------------------------- |
| **user-service**    | 4001 | User profiles, addresses, roles                |
| **order-service**   | 4002 | Orders, order items, order ownership           |
| **product-service** | 4003 | Product catalog and stock                      |
| **receipt-service** | 4004 | HTML & PDF receipts                            |
| **admin-service**   | 4005 | Server-rendered admin dashboard                |
| **fortune-service** | 4006 | Simple external API wrapper (practice service) |
| **auth-service**    | 4007 | Authentication, credentials, JWT verification  |

---

### Service responsibilities (important distinction)

* **Auth is a dedicated service**
  `auth-service` owns:

  * `/api/auth/register`
  * `/api/auth/login`
  * `/api/auth/logout`
  * `/api/auth/verify`
  * credential storage
  * JWT signing & verification

* **User service does NOT authenticate**
  It only manages user data and roles.

* Other services **verify JWTs by calling auth-service**, not by sharing secrets or databases.

---

## API Gateway (nginx)

All external traffic is intended to go through **nginx**.

* **Public entry point**:
  `http://localhost:8080`

### Health routes (via nginx)

```text
GET /health
GET /api/users/health
GET /api/orders/health
GET /api/products/health
GET /api/receipts/health
GET /api/admin/health
GET /api/auth/health
GET /api/fortune/health
```

### API routing examples

```text
/api/users/...     → user-service (4001)
/api/orders/...    → order-service (4002)
/api/products/...  → product-service (4003)
/api/receipts/...  → receipt-service (4004)
/api/auth/...      → auth-service (4007)
/api/fortune/...   → fortune-service (4006)
/admin/...         → admin-service (4005)
```

nginx configuration lives in:

```text
infra/nginx/nginx.conf
```

---

## Project Structure

### Root

```text
/
├─ services/
├─ scripts/
│  └─ seed.ts
├─ infra/nginx/
├─ package.json
└─ README.md
```

### Root scripts (`package.json`)

```bash
npm run dev:users
npm run dev:orders
npm run dev:products
npm run dev:receipts
npm run dev:admin
npm run dev:auth
npm run dev:fortune

npm run dev:all        # runs all services concurrently
npm run seed           # runs scripts/seed.ts
npm run nginx:on
npm run nginx:off
npm run nginx:reload
```

---

### Per-service layout (example)

```text
services/<service-name>/
├─ src/
│  ├─ app.ts
│  ├─ config/env.ts
│  ├─ controllers/
│  ├─ routes/
│  ├─ services/
│  ├─ models/
│  ├─ middleware/
│  ├─ clients/        # HTTP clients to other services
│  └─ templates/      # admin / receipt only
```

---

## Configuration

Each service loads its own `.env` file via `src/config/env.ts`.

> ⚠️ **Env variable names differ slightly between services**
> Always refer to each service’s `env.ts` for the authoritative list.

### Examples (not exhaustive)

**user-service**

```env
PORT=4001
MONGO_CONNECTION_STRING=mongodb://localhost:27017/microservices_users
```

**auth-service**

```env
PORT=4007
MONGO_CONNECTION_STRING=mongodb://localhost:27017/microservices_auth
JWTSECRET=your-local-jwt-secret
```

**order-service**

```env
PORT=4002
MONGO_CONNECTION_STRING=mongodb://localhost:27017/microservices_orders
AUTH_SERVICE_BASE_URL=http://localhost:4007/api
```

---

## Running the system

### 1. Start MongoDB

Make sure MongoDB is running locally and accessible from all services.

---

### 2. Start all services

```bash
npm run dev:all
```

Or start them individually.

---

### 3. Start nginx (Windows)

```bash
npm run nginx:on
```

nginx is expected at:

```text
C:\nginx\nginx-1.28.0\nginx-1.28.0\nginx.exe
```

(Adjust scripts if your path differs.)

---

### 4. Verify health

```bash
GET http://localhost:8080/health
GET http://localhost:8080/api/auth/health
GET http://localhost:8080/api/users/health
```

---

## Seeding demo data

### Running the seed

```bash
npm run seed
```

---

### What the seed does

The seed script (`scripts/seed.ts`) is **auth-aware and safe to re-run**.

It performs the following steps:

1. Verifies `/health` on all required services
2. Logs in as a **root admin user**
3. Wipes:

   * orders
   * products
   * users **except root admin**
   * credentials **except root admin**
4. Recreates:

   * users
   * credentials
   * products
   * orders (by logging in as seeded users)

---

### Seed safety design

* A **root admin user is never deleted**
* Root admin identity is controlled via env vars:

  ```env
  SEED_ROOT_ADMIN_EMAIL=seed-root-admin@sandbox.com
  SEED_ROOT_ADMIN_PASSWORD=SeedRootAdmin!123
  ```
* Destructive endpoints:

  * Require **JWT**
  * Require **Admin role**
  * Require explicit header:

    ```http
    x-seed-wipe: true
    ```
* The seed script is **idempotent** — it can be run repeatedly and always ends in a consistent state

This mirrors real-world operational constraints where seed logic must coexist with authentication and authorization.

---

## Typical flows

### User authentication

* Register / login via `auth-service`
* JWT is returned
* Other services verify the token by calling auth-service

---

### Creating orders

* User logs in
* Order service verifies ownership
* Product service validates stock
* Order is persisted

---

### Receipts

* Receipt service fetches:

  * order
  * user
  * products
* Renders Handlebars HTML
* Generates PDF via Playwright

---

### Admin dashboard

* Visit:

  ```text
  http://localhost:8080/admin
  ```
* Server-rendered HTML
* Reads from other services via HTTP

---

## Development notes

* No shared databases between services
* No shared auth secrets (auth-service is source of truth)
* All cross-service communication is explicit HTTP
* Error handling is centralized per service
* The project is intentionally verbose to make control-flow and ownership clear
