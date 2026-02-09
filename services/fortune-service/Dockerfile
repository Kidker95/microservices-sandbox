FROM node:20-alpine AS deps
WORKDIR /repo

COPY package*.json ./
COPY services/fortune-service/package*.json ./services/fortune-service/
COPY packages/ms-common/package*.json ./packages/ms-common/

RUN npm ci

FROM node:20-alpine AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY packages/ms-common ./packages/ms-common
COPY services/fortune-service ./services/fortune-service

RUN npm --prefix packages/ms-common run build
RUN npm --prefix services/fortune-service run build

FROM node:20-alpine AS run
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=build /repo/packages/ms-common ./packages/ms-common
COPY --from=build /repo/services/fortune-service/dist ./services/fortune-service/dist
COPY --from=build /repo/services/fortune-service/package*.json ./services/fortune-service/

WORKDIR /repo/services/fortune-service

EXPOSE 4006
CMD ["node", "dist/app.js"]
