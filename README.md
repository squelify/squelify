<<<<<<< HEAD
# Fastrue

[![Creator Badge](https://badgen.net/badge/icon/Made%20by%20Aris%20Ripandi?icon=bitcoin-lightning&label&color=blue&labelColor=black)](https://ripandis.com)
[![Twitter Badge](https://badgen.net/badge/icon/Follow%20Twitter?icon=twitter&label&color=blue&labelColor=black)](https://twitter.com/riipandi)
[![GitHub contributors](https://img.shields.io/github/contributors/riipandi/fastrue)](https://github.com/riipandi/fastrue/graphs/contributors)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./CODE_OF_CONDUCT.md)
[![License Bagde](https://badgen.net/github/license/riipandi/fastrue?label=license&color=blue&labelColor=black)](./LICENSE)
[![Github Sponsor](https://badgen.net/badge/icon/sponsors?icon=github&label&color=green&labelColor=black)](https://github.com/sponsors/riipandi)

<hr/>

> **WARNING!** This project still in development.
> Everything is experimental, breaking changes can happen and the long-term purpose
> of this project is not yet clear, use at your own risk!

## Introduction

Fastrue is a fast and robust authentication library for Fastify, inspired by Supabase GoTrue
(originally from Netlify GoTrue).

#### Notes

- HTTP 5XX errors are not listed for each endpoint. These should be handled globally. Not all HTTP 5XX errors are generated from Fastrue, and they may serve non-JSON content. Make sure you inspect the Content-Type header before parsing as JSON.
- Error responses are somewhat inconsistent. Avoid using the msg and HTTP status code to identify errors. HTTP 400 and 422 are used interchangeably in many APIs.
- If the server has CAPTCHA protection enabled, the verification token should be included in the request body.
- Rate limit errors are consistently raised with the HTTP 429 code.
- Enums are used only in request bodies / parameters and not in responses to ensure wide compatibility with code generators that fail to include an unknown enum case.

#### Backward compatibility:

- Endpoints marked as Experimental may change without notice.
- Endpoints marked as Deprecated will be supported for at least 3 months since being marked as deprecated.
- HTTP status codes like 400, 404, 422 may change for the same underlying error condition.

## License

This project is open-sourced software licensed under the [MIT license][choosealicense]

Copyrights in this project are retained by their contributors.

See the [license file](./LICENSE) for more information.

[choosealicense]: https://choosealicense.com/licenses/mit/

---

<sub>🤫 Psst! If you like my work you can support me via [GitHub sponsors](https://github.com/sponsors/riipandi).
=======
# NTRL Stack

Full-stack Nitro, Tailwind, React, LibSQL.

Look at the [nitro quick start](https://nitro.unjs.io/guide#quick-start) to learn more how to get started.
>>>>>>> ntrl/main
