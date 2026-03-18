# MF Agent Skills

This directory contains **Agent Skills** for Module Federation 2.0 — loadable instruction sets for AI coding assistants (Claude Code, Cursor, Windsurf, and more) that give them built-in knowledge of MF internals. No dependency on any company-internal infrastructure; works in any MF-based project.

For full documentation, see **[module-federation.io/guide/ai-skills](https://module-federation.io/guide/ai-skills)**.

## Installation

```bash
npx skills add module-federation/core
```

## Skill List

| Directory          | Skill Name        | Use Case                                                                                                                                                          |
| ------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mf-docs/`         | `mf-docs`         | Real-time MF 2.0 docs assistant — answers questions by fetching live docs from module-federation.io                                                               |
| `mf-context/`      | `mf-context`      | Collects project MF configuration context; the data foundation for all diagnostic Skills                                                                          |
| `mf-module-info/`  | `mf-module-info`  | Fetch a remote module's full info (publicPath, remoteEntry, exposes/remotes/shared from mf-manifest.json)                                                         |
| `mf-integrate/`    | `mf-integrate`    | Integrate Module Federation into an existing project — generates config for provider / consumer, supports Rsbuild / Rspack / Webpack / Modern.js / Next.js / Vite |
| `mf-type-check/`   | `mf-type-check`   | Type file generation failures, remote types not pulled, tsconfig paths missing                                                                                    |
| `mf-shared-deps/`  | `mf-shared-deps`  | shared/externals conflicts, antd/arco transformImport blocking sharing, multiple versions in build artifacts                                                      |
| `mf-perf/`         | `mf-perf`         | Slow HMR, slow build speed, DTS bottleneck (includes guided ts-go migration)                                                                                      |
| `mf-config-check/` | `mf-config-check` | Wrong MF plugin for bundler, missing asyncStartup, exposes key/path errors                                                                                        |
| `mf-bridge-check/` | `mf-bridge-check` | Non-standard Bridge API usage, sub-app integration issues                                                                                                         |

## How It Works

Each diagnostic Skill runs in two steps: the agent first calls `mf-context` to collect MFContext, then passes it as a JSON string via `--context` to the corresponding `scripts/*.js`. Each script is standalone with no dependency on the internal implementation of `context-fetcher`.

`mf-docs` works independently — it fetches relevant pages from `module-federation.io` at query time and answers based on the live content.
