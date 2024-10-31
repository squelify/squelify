# Fastrue Authentication Server

[![Release](https://img.shields.io/github/v/release/riipandi/fastrue?logo=Docker&color=orange)](https://github.com/riipandi/fastrue/releases)
[![Languages](https://img.shields.io/github/languages/top/riipandi/fastrue)](https://github.com/riipandi/fastrue)
[![Contribution](https://img.shields.io/badge/Contributions-welcome-gray.svg)](https://github.com/riipandi/fastrue/pulse)
<!-- [![Test](https://github.com/riipandi/fastrue/actions/workflows/test.yml/badge.svg)](https://github.com/riipandi/fastrue/actions/workflows/test.yml) -->

<hr/>

Fastrue is a headless authentication server inspired from Netlify GoTrue and Supabase Auth (formerly Supabase GoTrue), built with [Nitro][nitro] and [TypeScript][typescript].

> **WARNING!** This project still in development.
> Everything is experimental, breaking changes can happen and the long-term purpose of this project is not yet clear, use at your own risk!

## 🏁 Quick Start

### Prerequisites

TODO

### Generate Secret Key

Before you continue, you need to create `.env` file (you can duplicate `.env.example`) and
fill the `application secret key` with some random string. To generate a secret key, use
the following command:

```sh
pnpm fastrue make app-key
```

### Up and Running

1. Install dependencies: `pnpm install`
2. Prepare environment: `pnpm compose:up`
3. Run database migration: `pnpm fastrue migrate up`
4. Start development: `pnpm dev`

Application will run at `http://localhost:3000`

### Reset Database Migration

```sh
pnpm fastrue migrate reset --migrate --seed
```

## 🧑🏻‍💻 Development

TODO

### Simple Load Testing

Using [`hey`](https://github.com/rakyll/hey) to perform a simple load testing.

```sh
hey -n 1000 -c 200 -z 30s -m GET -T "application/json" http://localhost:3000/api/healthz
```

## 🚀 Deployment

Please see the [documentation page](https://fastrue.netlify.app/docs/getting-started/introduction/) for more detailed information.

## 🧑🏻‍💻 Contributing

Welcome, and thank you for your interest in contributing to Fastrue! There are many ways in which you can contribute,
beyond writing code. You can read this repository’s [Contributing Guidelines](./CONTRIBUTING.md) to learn how to contribute.

## Maintainer

Currently, [Aris Ripandi](htps://ripandis.com) ([@riipandi](https://twitter.com/riipandi)) is the only maintainer.

## License

This project is open-sourced software licensed under the [Apache License 2.0][choosealicense].

Copyrights in this project are retained by their contributors.

See the [license file](./LICENSE) for more information.

---

<sub>🤫 Psst! If you like my work you can support me via [GitHub sponsors](https://github.com/sponsors/riipandi).</sub>

[![Made by](https://badgen.net/badge/icon/Made%20by%20Aris%20Ripandi?icon=bitcoin-lightning&label&color=black&labelColor=black)][riipandi-x]

<!-- link reference definition -->
[nitro]: https://nitro.unjs.io
[choosealicense]: https://choosealicense.com/licenses/apache-2.0/
[riipandi-x]: https://x.com/intent/follow?screen_name=riipandi
[typescript]: https://www.typescriptlang.org
