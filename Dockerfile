# syntax=docker/dockerfile:1.7

# Arguments with default value (for build).
ARG RUN_IMAGE=gcr.io/distroless/nodejs20-debian12
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

# Required source files
COPY --from=builder /srv/package.json /srv/package.json
COPY --from=builder /srv/.npmrc /srv/.npmrc

# Generated files
COPY --from=builder /srv/pnpm-lock.yaml /srv/pnpm-lock.yaml
COPY --from=builder /srv/.output /srv/.output

# Install production dependencies and cleanup node_modules.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod \
    --frozen-lockfile --ignore-scripts && pnpm prune --prod \
    --ignore-scripts && pnpm dlx clean-modules clean --yes \
    "**/codecov*" "!**/@libsql/**"

# -----------------------------------------------------------------------------
# Production image, copy build output files and run the application.
# -----------------------------------------------------------------------------
FROM --platform=${PLATFORM} $RUN_IMAGE AS runner
LABEL org.opencontainers.image.source="https://github.com/riipandi/ntrl"

# ----- Read application environment variables --------------------------------

ARG APP_BASE_URL APP_DOMAIN APP_LOG_LEVEL JWT_SECRET_KEY \
    DATABASE_AUTO_MIGRATE DATABASE_TOKEN DATABASE_URL GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET S3_ACCESS_KEY_ID \
    S3_ACCOUNT_ID S3_BUCKET_NAME APP_CDN_URL S3_DEFAULT_REGION S3_ENDPOINT_URL \
    S3_SECRET_ACCESS_KEY SMTP_EMAIL_FROM SMTP_HOST SMTP_PASSWORD \
    SMTP_PORT SMTP_SECURE SMTP_USERNAME

ENV APP_BASE_URL=$APP_BASE_URL \
    APP_DOMAIN=$APP_DOMAIN \
    APP_LOG_LEVEL=$APP_LOG_LEVEL \
    JWT_SECRET_KEY=$JWT_SECRET_KEY \
    DATABASE_AUTO_MIGRATE=$DATABASE_AUTO_MIGRATE \
    DATABASE_TOKEN=$DATABASE_TOKEN \
    DATABASE_URL=$DATABASE_URL \
    GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
    GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
    GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
    GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
    S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID \
    S3_ACCOUNT_ID=$S3_ACCOUNT_ID \
    S3_BUCKET_NAME=$S3_BUCKET_NAME \
    APP_CDN_URL=$APP_CDN_URL \
    S3_DEFAULT_REGION=$S3_DEFAULT_REGION \
    S3_ENDPOINT_URL=$S3_ENDPOINT_URL \
    S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY \
    SMTP_EMAIL_FROM_NAME=$SMTP_EMAIL_FROM_NAME \
    SMTP_EMAIL_FROM_EMAIL=$SMTP_EMAIL_FROM_EMAIL \
    SMTP_HOST=$SMTP_HOST \
    SMTP_PASSWORD=$SMTP_PASSWORD \
    SMTP_PORT=$SMTP_PORT \
    SMTP_SECURE=$SMTP_SECURE \
    SMTP_USERNAME=$SMTP_USERNAME

# ----- Read application environment variables --------------------------------

# Copy the build output files from the pruner stage.
COPY --chown=nonroot:nonroot --from=pruner /srv/.output /srv

# Copy some necessary system utilities from build stage.
# To enhance security, consider avoiding the copying of sysutils.
COPY --from=builder /usr/bin/tini /usr/bin/tini
COPY --from=busybox /bin/mkdir /bin/mkdir
COPY --from=busybox /bin/clear /bin/clear
COPY --from=busybox /bin/cat /bin/cat
COPY --from=busybox /bin/ls /bin/ls
COPY --from=busybox /bin/sh /bin/sh

# Define the host and port to listen on.
ARG NODE_ENV=production HOST=0.0.0.0 PORT=3000
ENV NODE_ENV=$NODE_ENV HOST=$HOST PORT=$PORT
ENV TINI_SUBREAPER=true

WORKDIR /srv
USER nonroot:nonroot
EXPOSE $PORT

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/nodejs/bin/node", "/srv/server/index.mjs"]
