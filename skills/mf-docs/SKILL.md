---
name: mf-docs
description: Answer questions about Module Federation (MF) — configuration, runtime API, build plugins (Webpack/Rspack/Rsbuild/Vite), framework integration (React/Vue/Next.js/Modern.js/Angular), shared dependencies, exposes, remotes, debugging, troubleshooting, and micro-frontend architecture. Use this skill when the user asks anything about module federation, remote modules, shared deps, mf-manifest, federation runtime, or micro-frontends with MF.
compatibility: Requires internet access to fetch documentation from module-federation.io
allowed-tools: WebFetch
metadata:
  author: module-federation
  version: "1.0"
  docs: https://module-federation.io
---

# Module Federation Docs Assistant

Answer Module Federation questions by fetching only the relevant documentation pages — not the entire docs.

## Steps

### 1. Fetch the documentation index

Fetch the index to discover available pages and their descriptions:

```
https://module-federation.io/llms.txt
```

The index is in this format:

```
## Section Name
- [Page Title](/path/to/page.md): brief description of the page content
```

### 2. Identify the relevant page(s)

Read the page descriptions in the index and select the 1–3 pages most relevant to the user's question. Use the quick topic map below to narrow down candidates before reading descriptions.

**Quick topic map:**

| User asks about | Look in section |
|---|---|
| What is MF / concepts / glossary / getting started | `Guide` → `start/` |
| CLI, CSS isolation, type hints, data fetching, prefetch | `Guide` → `basic/` |
| Runtime API, `loadRemote`, MF instance, runtime hooks | `Guide` → `runtime/` |
| Build plugin setup for Webpack / Rspack / Rsbuild / Vite / Metro | `Guide` → `build-plugins/` |
| Next.js / Modern.js / Angular / React integration | `Guide` → `framework/` or `Practice` → `frameworks/` |
| React Bridge / Vue Bridge / cross-framework rendering | `Practice` → `bridge/` |
| `name`, `filename`, `exposes`, `remotes`, `shared`, `dts`, `manifest`, `shareStrategy` | `Configuration` |
| Runtime plugins, retry plugin, custom plugin | `Plugins` |
| Performance, tree shaking, shared scopes | `Guide` → `performance/` or `Guide` → `advanced/` |
| Debug mode, Chrome DevTool, global variables | `Guide` → `debug/` |
| Error messages, build errors, type errors | `Guide` → `troubleshooting/` |
| Monorepo, Nx | `Practice` → `monorepos/` |
| Deployment, Zephyr | `Guide` → `deployment/` |

### 3. Fetch the specific page(s)

Construct the URL by removing the `.md` extension from the path in the index, then prepend the base URL:

```
https://module-federation.io{path_without_md_extension}
```

**Examples:**
- `/guide/start/index.md` → `https://module-federation.io/guide/start/index`
- `/configure/shared.md` → `https://module-federation.io/configure/shared`
- `/guide/runtime/runtime-api.md` → `https://module-federation.io/guide/runtime/runtime-api`

Fetch the page(s) and read the content.

### 4. Answer the question

Answer based on the fetched content. If the answer spans multiple pages (e.g., config + runtime), fetch both. Do not load more than 3 pages per question.

## Important notes

- Always fetch the index first — never guess page paths from memory
- If the index descriptions are insufficient to identify the right page, fetch the most likely candidate and check its content
- The docs cover MF 2.0 (`@module-federation/enhanced`) — this is different from the older Webpack 5 built-in Module Federation
- Next.js support is deprecated; inform the user if they ask about it
