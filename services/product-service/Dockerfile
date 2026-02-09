FROM node:20-alpine AS deps
WORKDIR /repo

COPY package*.json ./
COPY services/product-service/package*.json ./services/product-service/
COPY packages/ms-common/package*.json ./packages/ms-common/

RUN npm ci

FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY packages/ms-common ./packages/ms-common
COPY services/product-service ./services/product-service

RUN npm --prefix packages/ms-common run build
RUN npm --prefix services/product-service run build

FROM node:20-alpine AS run
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/packages/ms-common ./packages/ms-common
COPY --from=build /repo/services/product-service/dist ./services/product-service/dist
COPY --from=build /repo/services/product-service/package*.json ./services/product-service/

WORKDIR /repo/services/product-service

EXPOSE 4003
CMD ["node", "dist/app.js"]
