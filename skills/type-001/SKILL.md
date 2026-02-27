---
name: mf-type-check
description: Diagnose TYPE-001 type issues: detect whether producer type files are correctly generated, and whether the consumer tsconfig is correctly configured. Use when the user encounters TS type errors, missing type files, or cannot consume remote types.
argument-hint: [project-root]
allowed-tools: Bash(node *)
---

**Step 1**: Call the `mf-context` Skill (pass `$ARGUMENTS`) to collect MFContext.

**Step 2**: Serialize MFContext to JSON and pass it to the check script via the `--context` argument:

```bash
node scripts/type-check.js --context '<MFContext-JSON>'
```

Process each item in the output `results` array:

**TYPE-001 · warning — `tsconfig.json` missing**
- `tsconfig.json` not found in the project root; cannot correctly configure remote type consumption
- Advise the user to create `tsconfig.json` and configure producer type paths in `paths`

**TYPE-001 · warning — `typescript` dependency missing**
- `typescript` not installed in `dependencies` / `devDependencies`
- Prompt the user to install: `pnpm add -D typescript`

**TYPE-001 · info — TypeScript environment ready**
- Both tsconfig and typescript detected; guide the user to further confirm:
  1. Whether the producer has DTS generation enabled (check the `dts` option in the `@module-federation/enhanced` plugin)
  2. Whether the consumer's `tsconfig.json` has `paths` configured to point to the producer's type files
  3. To temporarily skip type errors, add `"skipLibCheck": true` to `tsconfig.json`

> This Skill does not execute `tsc` proactively; it only performs configuration and dependency-level checks to avoid blocking user operations.
