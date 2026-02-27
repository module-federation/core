---
name: mf-shared-deps
description: Check Module Federation shared dependency configuration: detect whether shared.requiredVersion is compatible with the actually installed version, and surface potential runtime dependency conflicts. Use when host and remote use different versions of shared dependencies such as React or UI libraries.
argument-hint: [project-root]
allowed-tools: Bash(node *)
---

**Step 1**: Call the `mf-context` Skill (pass `$ARGUMENTS`) to collect MFContext.

**Step 2**: Serialize MFContext to JSON and pass it to the check script via the `--context` argument:

```bash
node scripts/shared-config-check.js --context '<MFContext-JSON>'
```

Process each item in the output `results` array:

**SHARED-DEPS · warning — Version incompatibility**
- `shared[name].requiredVersion` is incompatible with the locally installed version
- Show details: the declared `requiredVersion` vs the actually installed `actualVersion`
- Recommended actions:
  1. Align the version of this dependency across the host and all remote projects
  2. Or adjust the `requiredVersion` range to be compatible with the currently installed version
  3. Check whether this dependency appears in both `externals` and `shared` (duplicate configuration can cause issues)

**When results is empty**
- Inform the user that the current shared config version declarations are compatible with local dependencies
- Note: version compatibility needs to be verified jointly across the host and all remotes; only a single local-side check has been completed here
