# syntax=docker/dockerfile:1.7

# Arguments with default value (for build).
ARG PLATFORM=linux/amd64
ARG NODE_VERSION=20

FROM busybox:1.37-uclibc as busybox

# -----------------------------------------------------------------------------
# Base image with pnpm package manager.
# -----------------------------------------------------------------------------
FROM --platform=${PLATFORM} node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH" COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@latest-9 --activate
WORKDIR /srv

# -----------------------------------------------------------------------------
# Install dependencies and some toolchains.
# -----------------------------------------------------------------------------
FROM base AS builder
ENV LEFTHOOK=0 CI=true PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true

# Install system dependencies.
RUN apt-get update && apt-get -yqq install tini

# Copy the source files
COPY --chown=node:node . .

# Install dependencies and build the application.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install \
    --ignore-scripts && pnpm prepare && NODE_ENV=production pnpm build

# -----------------------------------------------------------------------------
# Compile the application and install production only dependencies.
# -----------------------------------------------------------------------------
FROM base AS pruner
ENV LEFTHOOK=0 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true NODE_ENV=production

# System utilities
COPY --from=builder /usr/bin/tini /usr/bin/tini

# Required source files
COPY --from=builder /srv/package.json /srv/package.json
COPY --from=builder /srv/.npmrc /srv/.npmrc

# Generated files
COPY --from=builder /srv/pnpm-lock.yaml /srv/pnpm-lock.yaml
COPY --from=builder /srv/.output /srv/.output

# Create the data directory and set permissions.
RUN mkdir -p /srv/_data && chmod 0775 /srv/_data

# Install production dependencies and cleanup node_modules.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod \
    --frozen-lockfile --ignore-scripts && pnpm prune --prod \
    --ignore-scripts && pnpm dlx clean-modules clean --yes \
    "**/codecov*" "!**/@libsql/**"
