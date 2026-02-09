FROM node:20-alpine AS deps
WORKDIR /repo

COPY package*.json ./
COPY services/auth-service/package*.json ./services/auth-service/
COPY packages/ms-common/package*.json ./packages/ms-common/

RUN npm ci

FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY packages/ms-common ./packages/ms-common
COPY services/auth-service ./services/auth-service

RUN npm --prefix packages/ms-common run build
RUN npm --prefix services/auth-service run build

FROM node:20-alpine AS run
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/packages/ms-common ./packages/ms-common
COPY --from=build /repo/services/auth-service/dist ./services/auth-service/dist
COPY --from=build /repo/services/auth-service/package*.json ./services/auth-service/

WORKDIR /repo/services/auth-service

EXPOSE 4007
CMD ["node", "dist/app.js"]
