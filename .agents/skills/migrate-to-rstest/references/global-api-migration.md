# Global API Migration

Use this reference when tests rely on globally available test APIs (Jest's `jest.<api>`, or Vitest's `vi.<api>` / `vitest.<api>` under `globals: true`).

For identifier mapping (`jest.` / `vi.` / `vitest.` -> Rstest equivalents), see the official guides:

- Jest: https://rstest.rs/guide/migration/jest.md (see "Test API")
- Vitest: https://rstest.rs/guide/migration/vitest.md (see "Test API" and "Global APIs")

The rules below are skill-side enforcement on top of that mapping.

## Mapping policy

- Prefer imports from `@rstest/core`; use globals only when preserving global-style tests (`globals: true` plus `@rstest/core/globals` types).
- Rstest globals include test APIs, hooks, `rs`, and `rstest`. Prefer `rs` for migration consistency.

## Red lines

1. **No shims.** All forms below leave the migration incomplete and must be rejected in every test and setup file:
   - `globalThis.vi = rs;` / `global.jest = rs;` (direct global aliasing)
   - `const vi = rs;` / `const jest = rs;` (local rebinding)
   - `import { rs as vi } from '@rstest/core';` / `import { rs as jest } from '@rstest/core';` (aliased named import)

   Fix at every call site instead. Do not propose a shim "just to keep the diff small" - it hides whether the migration actually happened, blocks IDE refactors, and silences future deprecation warnings.

2. **No test-name mutation.** When rewriting `vi.` / `jest.` / `vitest.`, only replace identifiers that precede a property access and eventual call expression. After every batch edit, grep test declarations to confirm no name string was rewritten:

```bash
rg -n "(describe|it|test)\\(" --glob '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'
```

Test names are stable identifiers, not labels for the new API.

3. **No mixed local aliases.** Avoid mixing `vi` and `rs`, or `jest` and `rs`, in the same migrated file. If you touch a file, migrate all framework utility calls in that file.

## Safer replacement workflow

1. Search first:

```bash
rg -n "\\b(vi|vitest|jest)\\s*\\." --glob '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}'
```

2. Replace only code identifiers, not arbitrary strings or snapshots.
3. Update imports from `vitest` / `@jest/globals` to `@rstest/core` as needed.
4. Run the search again; the only acceptable leftovers are comments documenting the migration or untouched legacy scopes.
5. If `globals: true` remains, verify TypeScript sees `@rstest/core/globals`.
