FROM node:20-alpine AS deps
WORKDIR /repo

COPY package*.json ./
COPY services/user-service/package*.json ./services/user-service/
COPY packages/ms-common/package*.json ./packages/ms-common/

RUN npm ci

FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY packages/ms-common ./packages/ms-common
COPY services/user-service ./services/user-service

RUN npm --prefix packages/ms-common run build
RUN npm --prefix services/user-service run build

FROM node:20-alpine AS run
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/packages/ms-common ./packages/ms-common
COPY --from=build /repo/services/user-service/dist ./services/user-service/dist
COPY --from=build /repo/services/user-service/package*.json ./services/user-service/

WORKDIR /repo/services/user-service

EXPOSE 4001
CMD ["node", "dist/app.js"]
