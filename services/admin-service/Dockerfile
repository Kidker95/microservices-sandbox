FROM node:20-alpine AS deps
WORKDIR /repo

# Copy workspace manifests first (better cache)
COPY package*.json ./
COPY services/admin-service/package*.json ./services/admin-service/
COPY packages/ms-common/package*.json ./packages/ms-common/

# Install workspace deps from repo root so @ms/common resolves locally
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules

COPY packages/ms-common ./packages/ms-common
COPY services/admin-service ./services/admin-service

RUN npm --prefix packages/ms-common run build
RUN npm --prefix services/admin-service run build

FROM node:20-alpine AS run
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/packages/ms-common ./packages/ms-common
COPY --from=build /repo/services/admin-service/dist ./services/admin-service/dist
COPY --from=build /repo/services/admin-service/package*.json ./services/admin-service/

WORKDIR /repo/services/admin-service

EXPOSE 4005
CMD ["node", "dist/app.js"]
