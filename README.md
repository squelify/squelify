<p align="center">
  <img src="./public/favicon.svg" width="80" height="80" alt="Squelify logo">
</p>

<h3 align="center">Headless CMS and Backend Platform without hassle</h3>

<p align="center">
  A modern headless CMS and backend-as-a-service platform.
</p>

<p align="center">
  <a href="https://squelify.com">Try it Now</a>
  ·
  <a href="https://github.com/squelify/squelify/issues">Report Bug</a>
  ·
  <a href="https://github.com/squelify/squelify/issues">Suggest Feature</a>
</p>

<p align="center">
  <a href="https://github.com/squelify/squelify/releases">
    <img src="https://img.shields.io/github/v/release/squelify/squelify?logo=Docker&color=orange" alt="Release">
  </a>
  <a href="https://github.com/squelify/squelify">
    <img src="https://img.shields.io/github/languages/top/squelify/squelify" alt="Languages">
  </a>
  <a href="https://github.com/squelify/squelify/pulse">
    <img src="https://img.shields.io/badge/Contributions-welcome-gray.svg" alt="Contribution">
  </a>
</p>

## Overview

A modern headless CMS and backend-as-a-service platform powered by Nitro, TypeScript,
LibSQL, and Kysely. Squelify is a lightweight and developer-friendly headless CMS
solution, inspired by amazing projects like Supabase, PocketBase, and Strapi.

> [!WARNING]
> 🚧 Heads up! We're actively cooking up new features - expect some bugs and changes along the way.
> <br/>Use in production at your own discretion!

[Learn more in our documentation.][squelify-docs]

## ✨ Key Features

Built by developers, for developers. Here's what you get:

- 🔐 Built-in Authentication System
  - Email/Password authentication
  - OAuth providers support
  - Two-factor authentication (2FA)
  - Passkey (WebAuthn) support

- 📚 Content Management
  - Dynamic content types
  - Flexible content modeling
  - Rich text editor
  - Media library

- 🛠 Developer Features
  - RESTful API
  - Real-time subscriptions
  - Role-based access control
  - Webhooks support
  - Rate limiting
  - Audit logs

- 💪 Technical Stack
  - [Nitro](https://nitro.unjs.io) - Next Generation Server Toolkit
  - [TypeScript](https://www.typescriptlang.org) - Type-safe development
  - [LibSQL](https://turso.tech/libsql) - SQLite for Modern Applications
  - [Kysely](https://kysely.dev) - Type-safe SQL query builder
  - [tRPC](https://trpc.io/) - End-to-end typesafe APIs made easy.

## 🏃 Getting Started

Check our [Contributing Guidelines](./CONTRIBUTING.md) for setup instructions.

## 📦 Deployment

We offer [Squelify docker image][squelify-docker] that enables you to effortlessly
self-host the platform. You have the flexibility to host Squelify across multiple
regions on [Fly.io](https://fly.io) or any other cloud providers of your choice.

See [Deployment Guide](./DEPLOY.md) for the deployment steps.

## 🤝 Contributing

We welcome contributions! Check our [Contributing Guidelines](./CONTRIBUTING.md) to
learn how you can help improve Squelify.

## ✅ Roadmap

Discover what's new and what's next on our exciting product roadmap! Join our
[community][squelify-forum] in shaping the future by voting on upcoming features
and sharing your brilliant ideas.

## 👤 Maintainer

Currently maintained by [Aris Ripandi](https://ripandis.com) ([@riipandi][riipandi-x]).

## 📜 License

Squelify project is released under the [Functional Source License][fsl-website]
(FSL-1.0-Apache-2.0) unless otherwise specified. Our CLI tools, SDKs, and client
libraries are licensed under the MIT License to give developers maximum
flexibility and freedom. Documentation is available under CC-BY-4.0 license.

This multi-license approach enables you to freely use, modify and distribute our
developer tools while ensuring sustainable development of the core platform.

For detailed licensing information, see the [LICENSE](./LICENSE.md) file.

## 💡 Acknowledgement

- **Inspiration**: Squelify's design draws inspiration from [Supabase][supabase], [Pocketbase][pocketbase] and [Strapi][strapi].
- **Licensing Model**: We took inspiration from [Sentry][sentry-licensing] and [GitButler][gitbutler-licensing] licensing model.
- **The Database**: Our database foundation is powered by [LibSQL][libsql].
- **Logo**: The Squelify logo was created with the help of [Canva][canva].

---

<sub>💝 Support this project via [GitHub sponsors][github-sponsors] or by subscribing on Polar.</sub>

<a href="https://polar.sh/squelify" target="_blank" rel="noopener noreferrer">
  <picture>
    <source media="(prefers-color-scheme: dark)"
      srcset="https://polar.sh/embed/subscribe.svg?org=squelify&label=Subscribe&darkmode"><img
      alt="Subscribe on Polar" src="https://polar.sh/embed/subscribe.svg?org=squelify&label=Subscribe">
  </picture>
</a>

<!-- link reference definition -->
[canva]: https://www.canva.com/
[choosealicense]: https://choosealicense.com/licenses/apache-2.0/
[contribution]: https://github.com/squelify/squelify/pulse
[duckdb]: https://duckdb.org
[fsl-website]: https://fsl.software/?ref=squelify.com
[gitbutler-licensing]: https://blog.gitbutler.com/opening-up-gitbutler/
[github-sponsors]: https://github.com/sponsors/squelify
[libsql]: https://turso.tech/libsql
[nitro]: https://nitro.unjs.io
[pocketbase]: https://pocketbase.io
[riipandi-x]: https://x.com/intent/follow?screen_name=riipandi
[sentry-licensing]: https://blog.sentry.io/introducing-the-functional-source-license-freedom-without-free-riding/
[squelify-docker]: https://github.com/squelify/squelify/pkgs/container/squelify
[squelify-docs]: https://squelify.com/docs
[squelify-forum]: https://github.com/squelify/squelify/discussions
[strapi]: https://strapi.io
[supabase]: https://supabase.com
