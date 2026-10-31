---
'@module-federation/third-party-dts-extractor': patch
---

Fix `extractThirdParty` silently producing no output when `@module-federation/dts-plugin` runs as ESM. `getPackageRootDir()` and `resolvePackageJson()` called the bare `require.resolve()`, which tsup's ESM build shims to a stub without `.resolve`; the resulting TypeError was swallowed, leaving third-party type extraction a no-op. Both now resolve via `createRequire(import.meta.url)`, matching existing usage elsewhere in the monorepo.
