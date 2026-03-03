---
name: mf-bridge-check
description: Check Module Federation Bridge usage: verify that producers correctly export export-app, and that consumers use the recommended Bridge API. Use when micro-frontend sub-app integration is unstable or errors occur.
argument-hint: [project-root]
allowed-tools: Bash(node *)
---

**Step 1**: Call the `mf-context` Skill (pass `$ARGUMENTS`) to collect MFContext.

**Step 2**: Serialize MFContext to JSON and pass it to the check script via the `--context` argument:

```bash
node scripts/bridge-check.js --context '<MFContext-JSON>'
```

Process each item in the output `results` and `context.mfConfig`:

**BRIDGE-USAGE · info — No export-app export found**
- No key matching the `export-app` pattern found in `exposes`
- If this project is a sub-app that should follow the Bridge spec, guide the user to:
  1. Add `"./export-app": "./src/export-app.tsx"` to `exposes`
  2. The exported module must return an object conforming to the Bridge spec (containing `render` and `destroy` methods)

**BRIDGE-USAGE · info — Consumer API recommendation**
- Advise consumers to use official Bridge APIs such as `createRemoteAppComponent`
- Avoid directly concatenating remote URLs or manually calling `loadRemote`

If `context.mfRole` is `host` (no exposes), skip the producer-side check and only provide consumer-side recommendations.
