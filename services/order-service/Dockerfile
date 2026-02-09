FROM node:20-alpine AS deps
WORKDIR /repo

COPY package*.json ./
COPY services/order-service/package*.json ./services/order-service/
COPY packages/ms-common/package*.json ./packages/ms-common/

RUN npm ci

FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY packages/ms-common ./packages/ms-common
COPY services/order-service ./services/order-service

RUN npm --prefix packages/ms-common run build
RUN npm --prefix services/order-service run build

FROM node:20-alpine AS run
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/packages/ms-common ./packages/ms-common
COPY --from=build /repo/services/order-service/dist ./services/order-service/dist
COPY --from=build /repo/services/order-service/package*.json ./services/order-service/

WORKDIR /repo/services/order-service

EXPOSE 4002
CMD ["node", "dist/app.js"]
