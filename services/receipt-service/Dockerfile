FROM node:20-alpine AS deps
WORKDIR /repo

COPY package*.json ./
COPY services/receipt-service/package*.json ./services/receipt-service/
COPY packages/ms-common/package*.json ./packages/ms-common/

RUN npm ci

FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY packages/ms-common ./packages/ms-common
COPY services/receipt-service ./services/receipt-service

RUN npm --prefix packages/ms-common run build
RUN npm --prefix services/receipt-service run build

FROM node:20-alpine AS run
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/packages/ms-common ./packages/ms-common
COPY --from=build /repo/services/receipt-service/dist ./services/receipt-service/dist
COPY --from=build /repo/services/receipt-service/package*.json ./services/receipt-service/

WORKDIR /repo/services/receipt-service

EXPOSE 4004
CMD ["node", "dist/app.js"]
