---
'@module-federation/managers': patch
'@module-federation/rspack': patch
'@module-federation/enhanced': patch
---

feat: resolve canonical share keys for relative imports to prevent singleton duplication (#5042)

In monorepos or multi-package repositories where packages use relative imports internally (e.g. `import { Context } from './FeatureTypeContext'`) while external consumers import via the canonical package specifier (e.g. `import { Context } from '@pkg/context-lib/FeatureTypeContext'`), Module Federation would previously bundle duplicate local instances because sharing was negotiated strictly by the raw import request specifier.

This introduces `CanonicalSharedPlugin` in `@module-federation/managers` (applied automatically by `@module-federation/rspack` and `@module-federation/enhanced` when `shared` options are configured). It intercepts relative import requests in `normalModuleFactory.hooks.beforeResolve`, maps the target file to its package root via `package.json` (`main`, `module`, and `exports`), and normalizes matching relative requests to their canonical shared package specifiers before module factorization.
