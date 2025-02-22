# Contributing Guideline

Please open an issue to discuss the contribution you wish to make before submitting any changes.

This way we can guide you through the process and give feedback.

## 🏁 Quick Start

You will need `Node.js >=20.18.0`, `pnpm >=10.1.0` and `Docker >= 26.1.3` installed on your machine.

### Up and Running

1. Install the required toolchain & SDK: [Node.js][nodejs], [pnpm][pnpm], and [Docker][docker].
2. Install required project dependencies: `pnpm install`
3. Create `.env` file or copy from `.env.example`, then configure required variables.
4. Generate application secret key: `pnpm --silent squelify make app-key`
5. Start the database server and local SMTP server: `pnpm compose:up`
6. Run database migration: `pnpm --silent squelify migrate up`
7. Run project in development mode: `pnpm dev`

> Application will run at <http://localhost:3278>

An alternative option for generating a secret key is to use [AuthWeb](https://auth.web.id/password).

### OAuth Configuration

Callback: `http://localhost:3278/api/auth/<PROVIDER>/callback`

### Webhooks

In order to receive webhooks (_i.e. notifications, payment integrations, etc_), you will need
to expose the local port to the internet. To expose a local port to the internet, you can use
service like [Tailscale Funnel][tailscale], [Expose][expose-dev], [ngrok][ngrok],
or [untun][untun] by [UnJS][unjs].

In this case we will use Tailscale Funnel. By default, no alias for `tailscale` is set up.
If you plan on frequently accessing the Tailscale CLI, you can add an alias to your `.bashrc`
or `.zshrc` to make it easier.

```sh
alias tailscale="/Applications/Tailscale.app/Contents/MacOS/Tailscale"
```

```sh
tailscale funnel --bg=false http://localhost:3278
tailscale funnel status
```

Reference: https://www.twilio.com/blog/expose-localhost-to-internet-with-tunnel

## 🔰 Database Migration

The migration generator creates new migration files with standardized naming format:
`YYYYMMXXX_NAME.ts` where:

- `YYYYMM`: Year and month (e.g. 202412)
- `XXX`: Sequential number within the month (e.g. 001)
- `NAME`: Migration name using snake_case

```bash
pnpm squelify make migration <name>
```

### Example

```sh
pnpm squelify make migration create_users_table
```

### Reset Migrations

To reset the database and seed the database with the default data, you can run the following command:

```sh
pnpm --silent squelify migrate reset --migrate --seed
```

### User Migrations

Squelify supports custom database migrations through SQL files.
Place your migration files in `sqdata/migrations` directory with
format `YYYYMMXXX_description.sql`:

#### Migration Filename Format:

`YYYYMMXXX` = Year Month Sequential Number

- YYYYMM (6 digits) = Year and Month (e.g. 202412)
- XXX (3 digits) = Sequential number within the month (e.g. 001)

#### Validation Rules

- File size limit: 1MB
- Reserved prefix `_sq_` not allowed
- Valid SQLite syntax required
- Foreign key integrity checks
- Column naming conventions
- Valid SQLite data types
- Proper constraint definitions
- Index limitations (max 5 per table)
- View definition validation
- Checksum verification

#### Example:
```sql
--- Path: sqdata/migrations/202411001_create_posts_table.sql

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER,
  deleted_at INTEGER
) STRICT;

CREATE TRIGGER IF NOT EXISTS trg_posts_timestamp
AFTER UPDATE ON posts
FOR EACH ROW
BEGIN
  UPDATE posts
  SET updated_at = strftime('%s', 'now')
  WHERE id = NEW.id;
END;

CREATE INDEX IF NOT EXISTS idx_posts_title ON posts(title);
CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
```

## Testing

> TODO: add more information here

### Simple Load Testing

Using [`oha`](https://github.com/hatoo/oha) to perform a simple load testing.

```sh
oha -z 10s -m GET http://localhost:3278/api/healthz -c 350 -n 10000
```

## 🐳 Docker Container

### Development Server

```sh
# Start development server
docker-compose up -d

# Stop development server
docker-compose down --remove-orphans --volumes
```

### Build Container

```sh
pnpm docker:build
```

### List Docker Images

```sh
pnpm docker:images
```

### Testing Container

```sh
docker run --network=host --rm -it --env-file .env \
  -v $(pwd)/sqdata:/srv/sqdata --name squelify \
  ghcr.io/squelify/squelify:latest
```

### Push Images

Sign in to container registry:

```sh
echo $REGISTRY_TOKEN | docker login ghcr.io --username YOUR_USERNAME --password-stdin
```

Push docker image:

```sh
docker push ghcr.io/squelify/squelify:latest
```

## 🚀 Deployment

Read [Deployment Guide](./DEPLOY.md) for detailed documentation.

<!-- link reference definition -->
[docker]: https://docs.docker.com/engine/install
[expose-dev]: https://expose.dev/
[ngrok]: https://ngrok.com/
[nodejs]: https://nodejs.org/en/download/
[pnpm]: https://pnpm.io/installation
[tailscale]: https://tailscale.com/kb/1223/funnel
[untun]: https://unjs.io/packages/untun
[unjs]: https://unjs.io
