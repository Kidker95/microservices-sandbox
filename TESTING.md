**Test Plan**
- Scope: minimal smoke, auth contract checks, and core behaviors for each service plus unit tests for `@ms/common`.
- Stack: Jest + Supertest. Tests run against Express `app` instances without listening on ports.
- Environment: `tests/setup-env.ts` sets required env vars so config loaders don’t throw.

**What’s Covered**
- Smoke: `/health` for every service and one deterministic “router mounted” check.
- Auth contracts: missing token `401`, invalid token `401`, admin `200` on admin-only endpoints, normal user `403` on admin-only endpoints.
- Core behaviors:
  - auth-service login returns token, verify returns AuthContext (real JWT; DB/services mocked).
  - user-service owner/admin access on `GET /api/users/:id` and a simple create path.
  - product-service list endpoint.
  - order-service owner/admin on `GET /api/orders/:id` plus forbidden case.
  - receipt-service HTML generation path with downstream clients mocked.
  - fortune-service returns a fortune with upstream mocked.
- `@ms/common` unit tests: env helpers, security middleware, createServiceApp, mongo-dal (mongoose mocked).

**What’s Mocked**
- Cross-service HTTP calls (AuthClient, fetchWithTimeout in clients, upstream API clients).
- Mongoose model calls (no real Mongo).
- Template rendering for admin/receipt HTML is mocked to avoid file I/O in tests.

**Run Tests**
```bash
npm test
```

**Add a New Service Test**
1. Create `services/<service>/src/app-for-test.ts` if it doesn’t exist.
2. Add a test file in `tests/services/<service>.test.ts`.
3. Use Supertest with the exported `app`.
4. Mock external calls (clients, models) to keep tests fast and deterministic.
