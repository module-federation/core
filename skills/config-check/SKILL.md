---
name: mf-config-check
description: Check Module Federation build configuration: verify that exposes keys start with ./, and that value paths exist. Use when modules cannot be correctly exposed or expected modules are missing from the build output.
argument-hint: [project-root]
allowed-tools: Bash(node *)
---

**Step 1**: Call the `mf-context` Skill (pass `$ARGUMENTS`) to collect MFContext.

**Step 2**: Serialize MFContext to JSON and pass it to the check script via the `--context` argument:

```bash
node scripts/config-exposes-check.js --context '<MFContext-JSON>'
```

Process each item in the output `results` array:

**CONFIG-EXPOSES · warning — key does not start with `./`**
- MF spec requires exposes keys to start with `./` (e.g., `"./Button"` not `"Button"`)
- Inform the user of the specific key name and guide them to correct the format

**CONFIG-EXPOSES · warning — path does not exist**
- The file referenced by the exposes value does not exist in the project. Show the specific key and incorrect path.
- Common causes:
  1. Typo in file path
  2. Path has an extension but the actual file extension differs (e.g., `.tsx` vs `.ts`)
  3. Incorrect relative path base (should be relative to project root)

**When results is empty**
- Inform the user that exposes config format and paths passed basic checks
- If build issues persist, suggest further checking `runtimeChunk` configuration and async entry settings
