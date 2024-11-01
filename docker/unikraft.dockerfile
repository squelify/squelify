# syntax=docker/dockerfile:1.7

# Arguments with default value (for build).
ARG PLATFORM=linux/amd64
ARG NODE_VERSION=20

FROM busybox:1.37-uclibc as busybox
FROM fastrue:builder AS pruner

# -----------------------------------------------------------------------------
# Production image, copy build output files and run the application.
# -----------------------------------------------------------------------------
FROM --platform=${PLATFORM} gcr.io/distroless/nodejs20-debian12 AS runner
FROM scratch as rootfs

# ----- Read application environment variables --------------------------------

ARG APP_BASE_URL APP_CDN_URL APP_DOMAIN APP_LOG_LEVEL DATABASE_AUTO_MIGRATE \
    DATABASE_MODE DATABASE_TOKEN DATABASE_URL GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET \
    GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET JWT_SECRET_KEY S3_ACCESS_KEY_ID \
    S3_ACCOUNT_ID S3_BUCKET_NAME S3_DEFAULT_REGION S3_ENDPOINT_URL S3_SECRET_ACCESS_KEY \
    SMTP_EMAIL_FROM SMTP_HOST SMTP_PASSWORD SMTP_PORT SMTP_SECURE SMTP_USERNAME

ENV APP_BASE_URL=$APP_BASE_URL \
  APP_CDN_URL=$APP_CDN_URL \
  APP_DOMAIN=$APP_DOMAIN \
  APP_LOG_LEVEL=$APP_LOG_LEVEL \
  DATABASE_AUTO_MIGRATE=$DATABASE_AUTO_MIGRATE \
  DATABASE_MODE=$DATABASE_MODE \
  DATABASE_TOKEN=$DATABASE_TOKEN \
  DATABASE_URL=$DATABASE_URL \
  GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID \
  GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET \
  GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
  GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
  JWT_SECRET_KEY=$JWT_SECRET_KEY \
  S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID \
  S3_ACCOUNT_ID=$S3_ACCOUNT_ID \
  S3_BUCKET_NAME=$S3_BUCKET_NAME \
  S3_DEFAULT_REGION=$S3_DEFAULT_REGION \
  S3_ENDPOINT_URL=$S3_ENDPOINT_URL \
  S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY \
  SMTP_EMAIL_FROM=$SMTP_EMAIL_FROM \
  SMTP_HOST=$SMTP_HOST \
  SMTP_PASSWORD=$SMTP_PASSWORD \
  SMTP_PORT=$SMTP_PORT \
  SMTP_SECURE=$SMTP_SECURE \
  SMTP_USERNAME=$SMTP_USERNAME

# ----- Read application environment variables --------------------------------

# Define the host and port to listen on.
ARG NODE_ENV=production HOST=0.0.0.0 PORT=3278
ENV NODE_ENV=$NODE_ENV HOST=$HOST PORT=$PORT

# Distribution configuration.
COPY --from=runner /etc/os-release /etc/os-release

# Copy the build output files from the pruner stage.
COPY --from=pruner /srv/_data /srv/_data
COPY --from=pruner /srv/.output /srv
