# Sub-skill: module-info

Fetch metadata and manifest info for a remote Module Federation module — publicPath, remoteEntry, type file URLs, and the module's remotes/exposes/shared from its mf-manifest.json.

Two modes:
1. **Consumer mode** — inside a consumer project; pass only the remote name; entry URL is resolved from mfConfig.remotes
2. **Standalone mode** — outside a consumer project; pass the remote name plus its remoteEntry URL directly

## Step 1: Parse ARGS

- First token → `<module-name>`
- If a second token looks like a URL (starts with `http`) → `<remoteEntry-url>` (standalone mode); remaining tokens → `[project-root]`
- Otherwise → `[project-root]` (consumer mode)

## Step 2a — Consumer mode (no URL provided)

Collect MFContext by reading and following the instructions in `./context.md`, passing `[project-root]` as the project root.

Then run:

```bash
node scripts/module-info.js --context '<MFContext-JSON>' --module '<module-name>'
```

## Step 2b — Standalone mode (URL provided)

Run with an empty context and the explicit URL:

```bash
node scripts/module-info.js --context '{}' --module '<module-name>' --url '<remoteEntry-url>'
```

## Step 3: Present the result

| Field | Description |
|---|---|
| `publicPath` | Base URL of the remote |
| `remoteEntry` | Full URL to `remoteEntry.js` |
| `typesZip` | URL to `@mf-types.zip` |
| `typesApi` | URL to `@mf-types.api` (shown only if present) |
| `hasSsr` | Whether SSR build artifacts were detected |
| `exposes` | Modules this remote exposes |
| `remotes` | Remotes this module depends on |
| `shared` | Shared dependencies declared by this module |

If `result.error` is set, surface it directly and stop.

## Step 4 (conditional)

If the user explicitly asks to see the type declarations (e.g. "show me the types", "what types does it export"), fetch `result.typesZip` or `result.typesApi` and display the relevant type definitions.
