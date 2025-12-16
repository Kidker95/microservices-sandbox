## Microservices Sandbox

This repository is a small **Node.js + TypeScript microservices playground** for an imaginary skateboard shop. It is meant for learning / demo purposes, not production.

### Overview

- **Tech stack**

  - **Runtime**: Node.js (TypeScript, CommonJS)
  - **Framework**: Express 5
  - **Database**: MongoDB (via Mongoose)
  - **Reverse proxy**: nginx (Windows, local install)
  - **Other**: Handlebars templates, Playwright (for PDF rendering), bcrypt / JWT for auth

- **Services**

  - **User Service** (`services/user-service`, port **4001**)
    - Manages users and authentication.
    - Exposes user CRUD routes (`/api/users`) and auth routes (`/api/auth`).
    - Uses **bcrypt** for password hashing and **JWT** for authentication.
  - **Order Service** (`services/order-service`, port **4002**)
    - Manages customer orders.
    - Stores orders in MongoDB and talks to the **User** and **Product** services via HTTP clients.
  - **Product Service** (`services/product-service`, port **4003**)
    - Manages catalog products in MongoDB.
  - **Receipt Service** (`services/receipt-service`, port **4004**)
    - Generates receipts for orders.
    - Talks to **User**, **Order** and **Product** services via HTTP clients.
    - Uses Handlebars + CSS templates and **Playwright** to generate a browser-based PDF.
  - **Admin Service** (`services/admin-service`, port **4005**)
    - Simple HTML admin dashboard.
    - Renders Handlebars templates for basic views and calls into other services to show health / data.

- **API Gateway / Routing**
  - All external traffic is meant to go through **nginx** (see `infra/nginx/nginx.conf`).
  - Public entry-point is `http://localhost:8080`.
  - Example routes:
    - `GET /health` – nginx health check.
    - `GET /api/users/health` – health of User service (proxy to `http://127.0.0.1:4001/health`).
    - `GET /api/orders/health` – health of Order service.
    - `GET /api/products/health` – health of Product service.
    - `GET /api/receipts/health` – health of Receipt service.
    - `GET /api/admin/health` – health of Admin service.
    - `GET /api/users/...` – routed to User service.
    - `GET /api/orders/...` – routed to Order service.
    - `GET /api/products/...` – routed to Product service.
    - `GET /api/receipts/...` – routed to Receipt service.
    - `GET /admin/...` / `GET /api/admin/...` – routed to Admin service.

### Project Structure

- **Root**

  - `package.json` – root dev scripts:
    - `npm run dev:users` – run User service in dev mode.
    - `npm run dev:orders` – run Order service in dev mode.
    - `npm run dev:products` – run Product service in dev mode.
    - `npm run dev:receipts` – run Receipt service in dev mode.
    - `npm run dev:admin` – run Admin service in dev mode.
    - `npm run dev:all` – run **all services concurrently**.
    - `npm run seed` – run TypeScript seed script (`scripts/seed.ts`) using `ts-node`.
    - `npm run nginx:on` / `npm run nginx:off` / `npm run nginx:reload` – control nginx on Windows.
  - `scripts/seed.ts` – orchestrated seed:
    - Checks `/health` on all services.
    - Wipes existing users, products and orders via `DELETE` endpoints.
    - Creates demo users, products and orders with semi-realistic data.
  - `infra/nginx/nginx.conf` – local nginx reverse proxy configuration.

- **Per-service layout** (example: `services/user-service`)
  - `src/app.ts` – Express app bootstrap.
  - `src/config/env.ts` – environment variable loading (via `dotenv`) and typed config.
  - `src/controllers` – request handlers / controllers.
  - `src/routes` – Express routers (e.g. `users-routes.ts`, `orders-routes.ts`).
  - `src/models` – domain models, enums, error types and Mongoose models.
  - `src/services` – business logic (e.g. auth, user, order, product, receipt services).
  - `src/middleware/error-middleware.ts` – centralized error handler.
  - `src/templates` (Admin + Receipt services only) – Handlebars templates + CSS.
  - `src/clients` (where present) – HTTP clients used for inter-service communication.
  - `src/utils` (where present) – small helpers like `async-handler`, `html-template`, `pdf-browser`.

### Prerequisites

- **Required**

  - Node.js **v18+** (recommended).
  - A running **MongoDB** instance (e.g. local `mongodb://localhost:27017`) – each service reads its own connection string from env.
  - Windows with **nginx** installed at:
    - `C:\nginx\nginx-1.28.0\nginx-1.28.0\nginx.exe`
    - (If your nginx is installed elsewhere, update the path in `scripts/nginx/*.ps1`.)

- **Optional / nice to have**
  - Postman or another HTTP client – a collection is included: `microservices-sandbox.postman_collection.json`.

### Configuration

Each service expects its own **`.env` file** under its folder, loaded by `src/config/env.ts`. Typical variables (exact names may vary per service):

- **User service**

  - `PORT=4001`
  - `MONGO_URI=mongodb://localhost:27017/microservices_users`
  - `JWT_SECRET=your-local-jwt-secret`

- **Order service**

  - `PORT=4002`
  - `MONGO_URI=mongodb://localhost:27017/microservices_orders`

- **Product service**

  - `PORT=4003`
  - `MONGO_URI=mongodb://localhost:27017/microservices_products`

- **Receipt service**

  - `PORT=4004`
  - `MONGO_URI=mongodb://localhost:27017/microservices_receipts`

- **Admin service**
  - `PORT=4005`

> **Note:** If your actual env variable names differ, adjust this section to match what is defined in each `env.ts`.

### Installing Dependencies

From the repo root:

```bash
npm install

# then install inside each service (you can also do this manually)
cd services/user-service && npm install
cd ../order-service && npm install
cd ../product-service && npm install
cd ../receipt-service && npm install
cd ../admin-service && npm install
```

(You can of course use your own automation or workspaces if you prefer.)

### Running the System

1. **Start MongoDB**

   - Make sure your MongoDB instance is up and accessible from the URIs in your `.env` files.

2. **Start all services**

   - From the repo root:
     ```bash
     npm run dev:all
     ```
   - Or start individual services:
     ```bash
     npm run dev:users
     npm run dev:orders
     npm run dev:products
     npm run dev:receipts
     npm run dev:admin
     ```

3. **Start nginx**

   - Ensure nginx is installed at `C:\nginx\nginx-1.28.0\nginx-1.28.0\nginx.exe` **or update the scripts**.
   - From the repo root:
     ```bash
     npm run nginx:on
     ```
   - nginx will:
     - Listen on `http://localhost:8080`.
     - Proxy API calls to the appropriate local service.

4. **Verify health**

   - Check nginx itself:
     - `GET http://localhost:8080/health`
   - Check services (via nginx):
     - `GET http://localhost:8080/api/users/health`
     - `GET http://localhost:8080/api/orders/health`
     - `GET http://localhost:8080/api/products/health`
     - `GET http://localhost:8080/api/receipts/health`
     - `GET http://localhost:8080/api/admin/health`

5. **Seed demo data**

   - With all services up and healthy:
     ```bash
     npm run seed
     ```
   - The seed script will:
     - Delete existing users, products and orders via their APIs.
     - Create a bunch of demo users, products and orders.

6. **Stop / reload nginx**
   - Stop:
     ```bash
     npm run nginx:off
     ```
   - Reload config:
     ```bash
     npm run nginx:reload
     ```

### Typical Flows

- **User sign‑up / login**

  - Use `User Service` endpoints (via nginx `http://localhost:8080/api/...`) to create and authenticate users.
  - JWTs issued by the User service can then be validated on protected endpoints (depending on how you wire up auth).

- **Creating orders**

  - Use seeded or manually created users and products.
  - Call `Order Service` endpoints to create orders; it will validate references and persist in MongoDB.

- **Generating receipts**

  - Call `Receipt Service` endpoints with an order reference.
  - The service will query other services, render a Handlebars template and use Playwright to produce a PDF.

- **Admin dashboard**
  - Visit `http://localhost:8080/admin/` in a browser.
  - You should see the admin UI rendered by the Admin service (exact pages depend on the current implementation).

### Development Notes

- All services use a similar **Express + TypeScript** structure to keep things consistent and easy to understand.
- Inter-service communication is done via **plain HTTP clients** (no shared database across services).
- Error handling is centralized with `error-middleware.ts` in each service.
- The project is intentionally small and opinionated so you can:
  - Practice working with multiple services.
  - Experiment with envs, routing, and resilience.
  - Extend or refactor the architecture as you learn.
