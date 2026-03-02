---
name: mf-version-check
description: Collect key dependency versions related to Module Federation in the current project to help diagnose MF and build tool version mismatches.
argument-hint: [project-root]
allowed-tools: Bash(node *)
---

**Step 1**: Call the `mf-context` Skill (pass `$ARGUMENTS`) to collect MFContext.

**Step 2**: Serialize MFContext to JSON and pass it to the version collection script via the `--context` argument:

```bash
node scripts/version-check.js --context '<MFContext-JSON>'
```

Organize and display the version information collected in `results[0].context.dependencies` to the user:

| Package | Description |
|---|---|
| `@module-federation/enhanced` | MF core package |
| `@module-federation/runtime` | MF runtime |
| `@rsbuild/core` | Rsbuild |
| `@rspack/core` | Rspack |
| `webpack` | Webpack |

Notes (only show installed packages):

- If `@module-federation/enhanced` is significantly outdated, upgrade to the latest stable version
- If the version combination has known issues, guide the user to consult the corresponding version's changelog or migration guide
