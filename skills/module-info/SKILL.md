---
name: mf-module-info
description: Fetch metadata for a specific remote module by name — publicPath, remoteEntry URL, type file URLs (@mf-types.zip / @mf-types.api), and whether SSR artifacts are present. Use when you need to inspect or verify a remote module's deployment details.
argument-hint: <module-name> [project-root]
allowed-tools: Bash(node *)
---

**Step 1**: Parse `$ARGUMENTS` — the first token is `<module-name>`, the remainder (if any) is `[project-root]`. Call the `mf-context` Skill (passing `[project-root]`) to collect MFContext.

**Step 2**: Locate the remote matching `<module-name>` in `context.mfConfig.remotes`.

- If no match is found, inform the user and list the available remote names from `context.mfConfig.remotes`. Stop here.

**Step 3**: Serialize MFContext to JSON and pass it along with the module name to the script:

```bash
node scripts/module-info.js --context '<MFContext-JSON>' --module '<module-name>'
```

**Step 4**: Present the `result` from the script output to the user:

| Field | Description |
|---|---|
| `publicPath` | Base URL of the remote |
| `remoteEntry` | Full URL to `remoteEntry.js` |
| `typesZip` | URL to `@mf-types.zip` |
| `typesApi` | URL to `@mf-types.api` (shown only if present) |
| `hasSsr` | Whether SSR build artifacts were detected |

If `result.error` is set, surface it directly and stop.
