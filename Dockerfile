FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base as ready-base
COPY --from=deps /app/node_modules /app/node_modules
ENV NODE_ENV=production

FROM ready-base
CMD ["pnpm", "start"]
