---
name: mf-context
description: Collects the current project's Module Federation context (MFContext) and outputs a structured summary. Serves as the data foundation for all MF diagnostic Skills; can also be called standalone to quickly understand the project's MF configuration.
argument-hint: [project-root]
allowed-tools: Read Glob
---

Collect the following information step by step from `$ARGUMENTS` (defaults to the current working directory if empty), then output the aggregated MFContext.

## 1. Basic Info

Read `{projectRoot}/package.json` and extract:
- `name`: project name
- Merge `dependencies` + `devDependencies` into a full dependency map

Detect the package manager (check files in order):
- `pnpm-lock.yaml` → pnpm
- `yarn.lock` → yarn
- `package-lock.json` → npm

## 2. Bundler & MF Config

Find config files in the following priority order (`.ts` / `.mts` take precedence over `.js` / `.mjs` / `.cjs`):

| Priority | Filename |
|---|---|
| 1 | `module-federation.config.{ts,mts,js,mjs,cjs}` |
| 2 | `rspack.config.{ts,mts,js,mjs,cjs}` |
| 3 | `rsbuild.config.{ts,mts,js,mjs,cjs}` |
| 4 | `webpack.config.{ts,js}` |

Read the first matched file and extract the `remotes`, `exposes`, and `shared` fields. Determine the bundler from the filename (`rspack` / `rsbuild` / `webpack`).

## 3. Determine MF Role

| Condition | Role |
|---|---|
| Has `remotes` and `exposes` | `host+remote` |
| Only `remotes` | `host` |
| Only `exposes` | `remote` |
| Neither | `unknown` |

## 4. Recent Error Event (optional)

Check if `.mf/diagnostics/latest.json` exists; if so, read its contents.

## 5. Build Artifacts (optional)

Check if `dist/mf-manifest.json` and `dist/mf-stats.json` exist; if so, read them.

---

Aggregate the above information and output the MFContext summary in the following structure:

```
project:
  name, packageManager, mfRole

bundler:
  name, configFile

mfConfig:
  remotes, exposes, shared

dependencies:
  (list installed packages related to MF and their versions)

latestErrorEvent: (if present)
buildArtifacts:   (if present)
```

For further diagnostics, call the corresponding diagnostic Skill based on this context.
