# syntax=docker/dockerfile:1.7

# Arguments with default value (for build).
ARG PLATFORM=linux/amd64
ARG NODE_VERSION=20

FROM busybox:1.37-glibc as glibc

# -----------------------------------------------------------------------------
# Base image with pnpm package manager.
# -----------------------------------------------------------------------------
FROM --platform=${PLATFORM} node:${NODE_VERSION}-bookworm-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_INTEGRITY_KEYS=0
ENV LEFTHOOK=0 CI=true PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true
ENV PNPM_HOME="/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest-10 --activate
WORKDIR /srv

# -----------------------------------------------------------------------------
# Install dependencies and build the application.
# -----------------------------------------------------------------------------
FROM base AS builder

# Install system dependencies.
RUN apt-get update && apt-get -yqq --no-install-recommends install tini

# Copy the source files
COPY --link . .

# Install dependencies and build the application.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install \
    --ignore-scripts && pnpm prepare && NODE_ENV=production pnpm build

# -----------------------------------------------------------------------------
# Cleanup the pruner stage and create data directory.
# -----------------------------------------------------------------------------
FROM base AS pruner

# Copy output and config file from the builder stage.
COPY --from=builder /srv/.output /srv

# Create the data directory and set permissions.
RUN mkdir -p /srv/_data/{backup,functions,migrations,public_html}
RUN chmod -R 0775 /srv/_data

# -----------------------------------------------------------------------------
# Production image, copy build output files and run the application.
# -----------------------------------------------------------------------------
FROM --platform=${PLATFORM} gcr.io/distroless/nodejs${NODE_VERSION}-debian12
LABEL org.opencontainers.image.source="https://github.com/squelify/squelify"

# ----- Read application environment variables --------------------------------

ARG DATABASE_MODE DATABASE_URL DATABASE_TOKEN DATABASE_AUTO_MIGRATE \
    SQUELIFY_BASE_URL SQUELIFY_DOMAIN SQUELIFY_JWT_SECRET_KEY SQUELIFY_LOG_LEVEL \
    SQUELIFY_AUDIT_LOG_ENABLE SQUELIFY_RATE_LIMIT_ENABLE GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET S3_ACCOUNT_ID \
    S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_BUCKET_NAME S3_ENDPOINT_URL \
    S3_CDN_URL SMTP_FROM_EMAIL SMTP_FROM_NAME SMTP_HOST SMTP_PORT \
    SMTP_USERNAME SMTP_PASSWORD SMTP_SECURE

# ----- Read application environment variables --------------------------------

# Copy the build output files from the pruner stage.
COPY --chown=nonroot:nonroot --from=pruner /srv /srv

# Copy some necessary system utilities from previous stage (~7MB).
# To enhance security, consider avoiding the copying of sysutils.
COPY --from=builder /usr/bin/tini /usr/bin/tini
COPY --from=glibc /bin/whoami /bin/whoami
COPY --from=glibc /bin/clear /bin/clear
COPY --from=glibc /bin/mkdir /bin/mkdir
COPY --from=glibc /bin/which /bin/which
COPY --from=glibc /bin/cat /bin/cat
COPY --from=glibc /bin/ls /bin/ls
COPY --from=glibc /bin/sh /bin/sh

# Define the host and port to listen on.
ARG NODE_ENV=production HOST=0.0.0.0 PORT=3278
ENV NODE_ENV=$NODE_ENV HOST=$HOST PORT=$PORT
ENV TINI_SUBREAPER=true

WORKDIR /srv
USER nonroot:nonroot
EXPOSE $PORT

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/nodejs/bin/node", "/srv/server/index.mjs"]
