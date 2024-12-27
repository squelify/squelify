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
ENV LEFTHOOK=0 CI=true PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
RUN corepack enable && corepack prepare pnpm@latest-9 --activate
WORKDIR /srv

# -----------------------------------------------------------------------------
# Install dependencies and some toolchains.
# -----------------------------------------------------------------------------
FROM base AS installer

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
FROM base AS builder

# Copy output files and config file from the installer stage.
COPY --from=installer /srv/ecosystem.json /srv/ecosystem.json
COPY --from=installer /srv/server/views /srv/server/views
COPY --from=installer /srv/.output /srv

# Create the data directory and set permissions.
RUN mkdir -p /srv/_data/{migrations,functions} && chmod -R 0775 /srv/_data

# -----------------------------------------------------------------------------
# Production image, copy build output files and run the application.
# -----------------------------------------------------------------------------
FROM --platform=${PLATFORM} gcr.io/distroless/nodejs20-debian12 AS runner
LABEL org.opencontainers.image.source="https://github.com/squelify/squelify"

# ----- Read application environment variables --------------------------------

ARG DATABASE_MODE DATABASE_URL DATABASE_TOKEN DATABASE_AUTO_MIGRATE \
    SQUELIFY_BASE_URL SQUELIFY_DOMAIN SQUELIFY_JWT_SECRET_KEY SQUELIFY_LOG_LEVEL \
    SQUELIFY_AUDIT_LOG_ENABLE SQUELIFY_RATE_LIMIT_ENABLE GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET S3_ACCOUNT_ID \
    S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_BUCKET_NAME S3_CDN_URL S3_ENDPOINT_URL \
    SMTP_FROM_EMAIL SMTP_FROM_NAME SMTP_HOST SMTP_PORT SMTP_USERNAME SMTP_PASSWORD SMTP_SECURE

ENV DATABASE_MODE \
    DATABASE_URL \
    DATABASE_TOKEN \
    DATABASE_AUTO_MIGRATE \
    SQUELIFY_BASE_URL \
    SQUELIFY_DOMAIN \
    SQUELIFY_JWT_SECRET_KEY \
    SQUELIFY_LOG_LEVEL \
    SQUELIFY_AUDIT_LOG_ENABLE \
    SQUELIFY_RATE_LIMIT_ENABLE \
    GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET \
    GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET \
    S3_ACCOUNT_ID \
    S3_ACCESS_KEY_ID \
    S3_SECRET_ACCESS_KEY \
    S3_BUCKET_NAME \
    S3_CDN_URL \
    S3_ENDPOINT_URL \
    SMTP_FROM_EMAIL \
    SMTP_FROM_NAME \
    SMTP_HOST \
    SMTP_PORT \
    SMTP_USERNAME \
    SMTP_PASSWORD \
    SMTP_SECURE

# ----- Read application environment variables --------------------------------

# Copy the build output files from the builder stage.
COPY --chown=nonroot:nonroot --from=builder /srv /srv

# Copy some necessary system utilities from previous stage.
# To enhance security, consider avoiding the copying of sysutils.
COPY --from=installer /usr/bin/tini /usr/bin/tini
COPY --from=busybox /bin/clear /bin/clear
COPY --from=busybox /bin/mkdir /bin/mkdir
COPY --from=busybox /bin/which /bin/which
COPY --from=busybox /bin/cat /bin/cat
COPY --from=busybox /bin/ls /bin/ls
COPY --from=busybox /bin/sh /bin/sh

# Define the host and port to listen on.
ARG NODE_ENV=production HOST=0.0.0.0 PORT=3278
ENV NODE_ENV=$NODE_ENV HOST=$HOST PORT=$PORT
ENV TINI_SUBREAPER=true

WORKDIR /srv
USER nonroot:nonroot
EXPOSE $PORT

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/nodejs/bin/node", "/srv/server/index.mjs"]
