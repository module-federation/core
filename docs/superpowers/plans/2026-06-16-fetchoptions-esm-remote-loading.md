# fetchOptions ESM Remote Loading — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let `registerRemotes(remotes, { fetchOptions })` attach custom HTTP headers to every asset of an ESM remote (manifest, entry, chunks, shared deps, manifest CSS) via a fetch + blob import-rewriting loader, with zero change to non-ESM / no-`fetchOptions` paths.

**Architecture:** A self-contained fetch+blob loader in `@module-federation/sdk` (hardened port of the PoC in `js-module-import/index.html`) fetches each module's source with headers, rewrites its static/dynamic imports to recursively-loaded blob URLs, and imports the blob. `runtime-core` threads a per-remote `fetchOptions` from the API down to `RemoteInfo`, routes ESM entries with `fetchOptions` to the new loader, authenticates the manifest fetch, and routes manifest CSS through the loader. Non-ESM remotes never reach the new branch and fall back to today's loaders.

**Tech Stack:** TypeScript monorepo, pnpm, Jest (jsdom env, `@swc/jest`), packages `sdk` and `runtime-core`.

---

## Background the implementer needs

- The PoC is `js-module-import/index.html` (read it first). Its comments are intentionally carried over into the ported code.
- `sdk` does **not** import from `runtime-core` (one-way dependency: `runtime-core` → `sdk`). The sdk loader therefore takes plain primitives (`entry`, `fetchOptions`, an optional `customFetch`) — never `RemoteInfo` or `loaderHook`.
- Why a blob loader at all: `<script src>` and native `import()` cannot carry headers, and the runtime does not intercept bundler chunk loads. Rewriting the whole ESM graph to blob imports is the only way headers reach chunks/shared deps. This only works for ESM output, hence the `module`/`esm` gate.
- sdk tests live in `packages/sdk/__tests__/*.spec.ts`, run with jsdom. Run a single sdk test file with:
  `pnpm --filter @module-federation/sdk exec jest --config jest.config.cjs <path> -t "<name>"`
- runtime-core tests: `pnpm --filter @module-federation/runtime-core test` (check the package's own jest config for single-file invocation).

## File structure

- **Create** `packages/sdk/src/blobLoad.ts` — the fetch+blob loader (pure rewriter + `resolveSpec` + `fetchText` + `loadModule` + `__mfDyn` shim + `loadEsmEntryWithFetch` + `loadCssWithFetch`). One responsibility: header-authenticated ESM blob loading.
- **Create** `packages/sdk/__tests__/blobLoad.spec.ts` — unit tests for the pure pieces.
- **Modify** `packages/sdk/src/index.ts` — export the new module.
- **Modify** `packages/runtime-core/src/type/config.ts` — add `fetchOptions` to `RemoteInfoCommon` and `RemoteInfo`.
- **Modify** `packages/runtime-core/src/remote/index.ts` — `registerRemotes` options + per-remote stamping.
- **Modify** `packages/runtime-core/src/core.ts` — public `registerRemotes` signature.
- **Modify** `packages/runtime-core/src/utils/load.ts` — `loadEntryDom` routing gate + `customFetch` builder.
- **Modify** `packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts` — authenticate manifest fetch.
- **Modify** `packages/runtime-core/src/utils/preload.ts` — route manifest CSS through the loader when `fetchOptions` present.

---

## Task 1: Pure rewriter + `resolveSpec` in the sdk loader

**Files:**
- Create: `packages/sdk/src/blobLoad.ts`
- Test: `packages/sdk/__tests__/blobLoad.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/sdk/__tests__/blobLoad.spec.ts
import { resolveSpec, rewriteModuleCode } from '../src/blobLoad';

describe('resolveSpec', () => {
  it('returns absolute urls untouched', () => {
    expect(resolveSpec('https://x.com/a.js', 'https://b.com/')).toBe('https://x.com/a.js');
    expect(resolveSpec('blob:abc', 'https://b.com/')).toBe('blob:abc');
    expect(resolveSpec('data:text/js,1', 'https://b.com/')).toBe('data:text/js,1');
  });

  it('resolves relative and absolute-path specifiers against the base', () => {
    expect(resolveSpec('./dep.js', 'https://b.com/app/entry.js')).toBe('https://b.com/app/dep.js');
    expect(resolveSpec('/root.js', 'https://b.com/app/entry.js')).toBe('https://b.com/root.js');
  });

  it('throws on bare specifiers', () => {
    expect(() => resolveSpec('react', 'https://b.com/')).toThrow('bare specifier');
  });
});

describe('rewriteModuleCode', () => {
  const url = 'https://b.com/app/entry.js';

  it('pins import.meta.url to the module url', () => {
    const { code } = rewriteModuleCode('const u = import.meta.url;', url);
    expect(code).toBe(`const u = ${JSON.stringify(url)};`);
  });

  it('routes dynamic import() through __mfDyn with the base url', () => {
    const { code } = rewriteModuleCode('const m = import("./x.js");', url);
    expect(code).toBe(`const m = __mfDyn(${JSON.stringify(url)},"./x.js");`);
  });

  it('collects static relative/absolute deps and leaves bare imports alone', () => {
    const src = `import a from "./a.js";\nexport { b } from "/b.js";\nimport c from "react";`;
    const { deps } = rewriteModuleCode(src, url);
    expect(deps.map((d) => d.spec).sort()).toEqual(['./a.js', '/b.js']);
    expect(deps.find((d) => d.spec === './a.js')!.depUrl).toBe('https://b.com/app/a.js');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @module-federation/sdk exec jest --config jest.config.cjs __tests__/blobLoad.spec.ts`
Expected: FAIL — cannot find module `../src/blobLoad`.

- [ ] **Step 3: Write minimal implementation**

```ts
// packages/sdk/src/blobLoad.ts

// Hardened port of the fetch + blob import-rewriting loader PoC
// (js-module-import/index.html). Comments are retained from the PoC where the
// logic is carried over verbatim.

export interface BlobDep {
  original: string;
  spec: string;
  quote: string;
  depUrl: string;
}

// Resolve a specifier (relative, absolute-path, or already-absolute-url)
// against a base url to a concrete fetchable url. The MF runtime resolves
// shared deps to relative loadShare asset urls, so bare specifiers never reach
// the loader; anything bare is unexpected and throws.
export function resolveSpec(spec: string, base: string): string {
  if (/^(blob:|https?:|data:)/.test(spec)) return spec;
  if (spec.startsWith('.') || spec.startsWith('/')) return new URL(spec, base).href;
  throw new Error(`[loader] cannot resolve bare specifier "${spec}" (from ${base})`);
}

// Rewrite a module's source: pin import.meta.url, route dynamic imports through
// __mfDyn, and collect static relative/absolute specifiers (to be replaced with
// recursively-loaded blob urls by the caller).
export function rewriteModuleCode(
  code: string,
  url: string,
): { code: string; deps: BlobDep[] } {
  // import.meta.url -> the module's real url.
  // In this case, modules with publicPath:"auto" can derive paths from it.
  code = code.replace(/\bimport\.meta\.url\b/g, JSON.stringify(url));

  // Dynamic import(...) -> __mfDyn("<url>", ...).
  code = code.replace(/(?<![.\w$])import\s*\(/g, `__mfDyn(${JSON.stringify(url)},`);

  // Static `import * from ...` and `import ...` -> recursively-loaded blob urls.
  const specRe = /(?<![.\w$])(from|import)\s*(['"])([^'"]+)\2/g;
  const deps: BlobDep[] = [];
  for (const m of code.matchAll(specRe)) {
    const spec = m[3];
    if (spec.startsWith('.') || spec.startsWith('/')) {
      deps.push({ original: m[0], spec, quote: m[2], depUrl: resolveSpec(spec, url) });
    }
  }
  return { code, deps };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @module-federation/sdk exec jest --config jest.config.cjs __tests__/blobLoad.spec.ts`
Expected: PASS (all `resolveSpec` and `rewriteModuleCode` tests green).

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/src/blobLoad.ts packages/sdk/__tests__/blobLoad.spec.ts
git commit -m "feat(sdk): add blob-loader import rewriter and resolveSpec"
```

---

## Task 2: `fetchText`, `loadModule`, `__mfDyn`, and the public loader functions

**Files:**
- Modify: `packages/sdk/src/blobLoad.ts`
- Modify: `packages/sdk/src/index.ts`
- Test: `packages/sdk/__tests__/blobLoad.spec.ts`

- [ ] **Step 1: Write the failing test**

Append to `packages/sdk/__tests__/blobLoad.spec.ts`:

```ts
import { fetchText, loadModule, loadEsmEntryWithFetch } from '../src/blobLoad';

describe('fetchText', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  it('merges fetchOptions headers and returns response text', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('CODE'),
    });
    const text = await fetchText('https://b.com/e.js', {
      fetchOptions: { headers: { Authorization: 'Bearer t' } },
    });
    expect(text).toBe('CODE');
    const init = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(init.headers).toEqual({ Authorization: 'Bearer t' });
  });

  it('prefers customFetch when it returns a Response', async () => {
    const customFetch = jest.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('HOOKED') } as any);
    // jsdom Response check: stub instanceof via a real Response-like guard is awkward,
    // so the implementation treats any object with ok+text as usable when customFetch returns it.
    const text = await fetchText('https://b.com/e.js', { customFetch });
    expect(customFetch).toHaveBeenCalled();
    expect(text).toBe('HOOKED');
    expect((global.fetch as jest.Mock)).not.toHaveBeenCalled();
  });

  it('throws a descriptive error on non-ok responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized', text: () => Promise.resolve('') });
    await expect(fetchText('https://b.com/e.js', {})).rejects.toThrow('BlobLoaderNetworkError: 401');
  });
});

describe('loadModule', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    (global.URL as any).createObjectURL = jest.fn((blob: Blob) => `blob:${(blob as any).__id || 'x'}`);
    loadModule.clearCache();
  });

  it('rewrites a static dep to a recursively-loaded blob url and caches by url', async () => {
    const files: Record<string, string> = {
      'https://b.com/entry.js': `import dep from "./dep.js";`,
      'https://b.com/dep.js': `export default 1;`,
    };
    (global.fetch as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve({ ok: true, text: () => Promise.resolve(files[url]) }),
    );
    const blobUrl = await loadModule('https://b.com/entry.js', {});
    expect(blobUrl).toMatch(/^blob:/);
    // dep fetched exactly once; entry fetched once
    expect((global.fetch as jest.Mock).mock.calls.map((c) => c[0]).sort()).toEqual([
      'https://b.com/dep.js',
      'https://b.com/entry.js',
    ]);
    // second call for same url is served from cache (no extra fetch)
    await loadModule('https://b.com/entry.js', {});
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @module-federation/sdk exec jest --config jest.config.cjs __tests__/blobLoad.spec.ts`
Expected: FAIL — `fetchText` / `loadModule` not exported (and `loadModule.clearCache` missing).

- [ ] **Step 3: Write minimal implementation**

Append to `packages/sdk/src/blobLoad.ts`:

```ts
export type BlobFetcher = (
  url: string,
  init: RequestInit,
) => Promise<Response | void | false> | Response | void | false;

export interface BlobLoadContext {
  fetchOptions?: RequestInit;
  // Optional custom fetch (e.g. routed through the runtime loaderHook.fetch so
  // existing fetch-hook plugins still compose). Falls back to native fetch.
  customFetch?: BlobFetcher;
}

// absolute url -> Promise<blob url>
const cache = new Map<string, Promise<string>>();
// absolute url -> the context it was loaded with, so __mfDyn can reuse the
// right headers for runtime dynamic imports of that module's chunks.
const contexts = new Map<string, BlobLoadContext>();
let dynImportInstalled = false;

function isResponseLike(res: unknown): res is Response {
  return (
    !!res &&
    typeof res === 'object' &&
    typeof (res as Response).text === 'function' &&
    'ok' in (res as Response)
  );
}

export async function fetchText(url: string, ctx: BlobLoadContext): Promise<string> {
  const { headers, ...rest } = ctx.fetchOptions || {};
  const init: RequestInit = { ...rest, headers: { ...(headers as Record<string, string>) } };
  let res: Response | void | false;
  if (ctx.customFetch) {
    res = await ctx.customFetch(url, init);
  }
  if (!isResponseLike(res)) {
    res = await fetch(url, init);
  }
  if (!res.ok) {
    throw new Error(`BlobLoaderNetworkError: ${res.status} ${res.statusText} for ${url}`);
  }
  return res.text();
}

// Fetch a module with headers, rewrite its imports.
// Dynamic imports are handled lazily at runtime via __mfDyn,
// Static relative imports are pre-loaded recursively.
export function loadModule(url: string, ctx: BlobLoadContext): Promise<string> {
  if (cache.has(url)) return cache.get(url)!;
  contexts.set(url, ctx);

  const promise = (async () => {
    const raw = await fetchText(url, ctx);
    const { code: rewritten, deps } = rewriteModuleCode(raw, url);
    let code = rewritten;
    const blobUrls = await Promise.all(deps.map((d) => loadModule(d.depUrl, ctx)));
    deps.forEach((d, i) => {
      const replaced = d.original.replace(
        `${d.quote}${d.spec}${d.quote}`,
        `${d.quote}${blobUrls[i]}${d.quote}`,
      );
      code = code.split(d.original).join(replaced);
    });
    return URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  })();

  cache.set(url, promise);
  return promise;
}

// Test seam: reset the module/context caches between cases.
loadModule.clearCache = () => {
  cache.clear();
  contexts.clear();
};

function installDynImportShim(): void {
  if (dynImportInstalled) return;
  dynImportInstalled = true;

  // Runtime dynamic-import shim: resolve url + fetch from cache or with headers + import as blob.
  (globalThis as Record<string, unknown>).__mfDyn = async (base: string, spec: string) => {
    const resolved = resolveSpec(spec, base);
    if (/^(blob:|data:)/.test(resolved)) {
      return import(/* webpackIgnore: true */ /* @vite-ignore */ resolved);
    }
    const ctx = contexts.get(base) || {};
    return import(/* webpackIgnore: true */ /* @vite-ignore */ await loadModule(resolved, ctx));
  };

  // The vite preload helper creates native <link> preloads (no auth header) as a
  // perf hint; let those 401 quietly instead of throwing — real loads go via __mfDyn.
  if (typeof window !== 'undefined') {
    window.addEventListener('vite:preloadError', (e) => e.preventDefault());
  }
}

export async function loadEsmEntryWithFetch({
  entry,
  fetchOptions,
  customFetch,
}: {
  entry: string;
  fetchOptions?: RequestInit;
  customFetch?: BlobFetcher;
}): Promise<Record<string, unknown>> {
  installDynImportShim();
  const blobUrl = await loadModule(entry, { fetchOptions, customFetch });
  return import(/* webpackIgnore: true */ /* @vite-ignore */ blobUrl);
}

export async function loadCssWithFetch({
  href,
  fetchOptions,
  customFetch,
}: {
  href: string;
  fetchOptions?: RequestInit;
  customFetch?: BlobFetcher;
}): Promise<void> {
  const text = await fetchText(href, { fetchOptions, customFetch });
  const blob = URL.createObjectURL(new Blob([text], { type: 'text/css' }));
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = blob;
  document.head.appendChild(link);
}
```

Add the `clearCache` member to the exported type by declaring it on the function. If TypeScript complains about assigning `clearCache` to a function, change the declaration to:

```ts
export const loadModule: ((url: string, ctx: BlobLoadContext) => Promise<string>) & {
  clearCache: () => void;
} = Object.assign(loadModuleImpl, { clearCache: () => { cache.clear(); contexts.clear(); } });
```

and rename the function body to `function loadModuleImpl(...)`. (Recursive calls inside the body must call `loadModule`, which is fine since it is in scope.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @module-federation/sdk exec jest --config jest.config.cjs __tests__/blobLoad.spec.ts`
Expected: PASS.

- [ ] **Step 5: Export from the sdk barrel**

Modify `packages/sdk/src/index.ts` — add after the `export * from './dom';` line:

```ts
export * from './blobLoad';
```

- [ ] **Step 6: Type-check the sdk package**

Run: `pnpm --filter @module-federation/sdk exec tsc -p tsconfig.lib.json --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/sdk/src/blobLoad.ts packages/sdk/src/index.ts packages/sdk/__tests__/blobLoad.spec.ts
git commit -m "feat(sdk): add fetch+blob ESM loader (loadEsmEntryWithFetch, loadCssWithFetch)"
```

---

## Task 3: Thread `fetchOptions` through types and `registerRemotes`

**Files:**
- Modify: `packages/runtime-core/src/type/config.ts:15-43`
- Modify: `packages/runtime-core/src/remote/index.ts:502-509`
- Modify: `packages/runtime-core/src/core.ts:458-460`

- [ ] **Step 1: Add `fetchOptions` to the types**

In `packages/runtime-core/src/type/config.ts`, add `fetchOptions?: RequestInit;` to `RemoteInfoCommon` (currently lines 15-20):

```ts
export interface RemoteInfoCommon {
  alias?: string;
  shareScope?: string | string[];
  type?: RemoteEntryType;
  entryGlobalName?: string;
  fetchOptions?: RequestInit;
}
```

And to `RemoteInfo` (currently lines 34-43):

```ts
export interface RemoteInfo {
  alias?: string;
  name: string;
  version?: string;
  buildVersion?: string;
  entry: string;
  type: RemoteEntryType;
  entryGlobalName: string;
  shareScope: string | string[];
  fetchOptions?: RequestInit;
}
```

`getRemoteInfo` (`utils/load.ts:393`) already spreads `...remote`, so `fetchOptions` flows onto `RemoteInfo` automatically — no change needed there.

- [ ] **Step 2: Update `registerRemotes` to accept and stamp `fetchOptions`**

In `packages/runtime-core/src/remote/index.ts`, replace the `registerRemotes` method (lines 502-509):

```ts
  registerRemotes(
    remotes: Remote[],
    options?: { force?: boolean; fetchOptions?: RequestInit },
  ): void {
    const { host } = this;
    remotes.forEach((remote) => {
      // fetchOptions passed to this call applies to each remote registered in
      // it; an explicit per-remote fetchOptions on the remote object wins.
      if (options?.fetchOptions && remote.fetchOptions === undefined) {
        remote.fetchOptions = options.fetchOptions;
      }
      this.registerRemote(remote, host.options.remotes, {
        force: options?.force,
      });
    });
  }
```

- [ ] **Step 3: Update the public `registerRemotes` signature**

In `packages/runtime-core/src/core.ts`, replace lines 458-460:

```ts
  registerRemotes(
    remotes: Remote[],
    options?: { force?: boolean; fetchOptions?: RequestInit },
  ): void {
    return this.remoteHandler.registerRemotes(remotes, options);
  }
```

(The public wrapper in `packages/runtime/src/index.ts:94` uses `Parameters<ModuleFederation['registerRemotes']>`, so it updates automatically.)

- [ ] **Step 4: Write the test**

Create `packages/runtime-core/src/remote/__tests__/register-fetch-options.spec.ts` (match the package's existing test location/extension — if runtime-core uses a top-level `__tests__`, place it there instead):

```ts
import { ModuleFederation } from '../../core';

describe('registerRemotes fetchOptions', () => {
  it('stamps call-level fetchOptions onto each remote that lacks its own', () => {
    const mf = new ModuleFederation({ name: 'host', remotes: [] });
    const fetchOptions = { headers: { Authorization: 'Bearer t' } };
    const r1: any = { name: 'a', entry: 'http://x/a.json' };
    const r2: any = { name: 'b', entry: 'http://x/b.json', fetchOptions: { headers: { 'X-B': '1' } } };
    mf.registerRemotes([r1, r2], { fetchOptions });
    const stored = (mf as any).options.remotes;
    expect(stored.find((r: any) => r.name === 'a').fetchOptions).toBe(fetchOptions);
    expect(stored.find((r: any) => r.name === 'b').fetchOptions).toEqual({ headers: { 'X-B': '1' } });
  });
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @module-federation/runtime-core test` (scope to the new file if the package's jest config supports a path argument).
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/runtime-core/src/type/config.ts packages/runtime-core/src/remote/index.ts packages/runtime-core/src/core.ts packages/runtime-core/src/remote/__tests__/register-fetch-options.spec.ts
git commit -m "feat(runtime-core): thread per-remote fetchOptions through registerRemotes"
```

---

## Task 4: Route ESM entries with `fetchOptions` to the blob loader

**Files:**
- Modify: `packages/runtime-core/src/utils/load.ts:1-6` (import) and `:189-220` (`loadEntryDom`)
- Test: `packages/runtime-core/src/utils/__tests__/load-entry-fetch-options.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/runtime-core/src/utils/__tests__/load-entry-fetch-options.spec.ts
jest.mock('@module-federation/sdk', () => {
  const actual = jest.requireActual('@module-federation/sdk');
  return { ...actual, loadEsmEntryWithFetch: jest.fn().mockResolvedValue({ ok: 1 }) };
});

import { loadEsmEntryWithFetch } from '@module-federation/sdk';
import { __loadEntryDomForTest } from '../load';

describe('loadEntryDom ESM fetchOptions gate', () => {
  const loaderHook: any = { lifecycle: { fetch: { emit: jest.fn() } } };

  it('uses the blob loader for module remotes carrying fetchOptions', async () => {
    const remoteInfo: any = {
      name: 'a', entry: 'http://x/e.js', type: 'module', entryGlobalName: 'a',
      shareScope: 'default', fetchOptions: { headers: { Authorization: 'Bearer t' } },
    };
    await __loadEntryDomForTest({ remoteInfo, loaderHook });
    expect(loadEsmEntryWithFetch).toHaveBeenCalledWith(
      expect.objectContaining({ entry: 'http://x/e.js', fetchOptions: remoteInfo.fetchOptions }),
    );
  });
});
```

If `loadEntryDom` is not exported, add a thin test-only export at the bottom of `load.ts`:

```ts
export const __loadEntryDomForTest = loadEntryDom;
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @module-federation/runtime-core test` (scoped to the new file).
Expected: FAIL — blob loader not invoked (still calls `loadEsmEntry`), or `__loadEntryDomForTest` missing.

- [ ] **Step 3: Add the import**

In `packages/runtime-core/src/utils/load.ts`, extend the `@module-federation/sdk` import (lines 1-6):

```ts
import {
  loadScript,
  loadScriptNode,
  composeKeyWithSeparator,
  isBrowserEnvValue,
  loadEsmEntryWithFetch,
} from '@module-federation/sdk';
```

- [ ] **Step 4: Add the routing gate**

In `loadEntryDom` (lines 202-219), replace the `esm`/`module` case so it routes to the blob loader when `fetchOptions` is present:

```ts
  const { entry, entryGlobalName: globalName, name, type } = remoteInfo;
  switch (type) {
    case 'esm':
    case 'module':
      return remoteInfo.fetchOptions
        ? loadEsmEntryWithFetch({
            entry,
            fetchOptions: remoteInfo.fetchOptions,
            // Route the loader's fetches through the runtime fetch hook so
            // existing fetch-hook plugins still compose; merged headers are
            // applied inside the sdk loader, native fetch is the fallback.
            customFetch: (url, init) =>
              loaderHook.lifecycle.fetch.emit(url, init, remoteInfo),
          })
        : loadEsmEntry({ entry, remoteEntryExports });
    case 'system':
      return loadSystemJsEntry({ entry, remoteEntryExports });
    default:
      return loadEntryScript({
        entry,
        globalName,
        name,
        remoteInfo,
        loaderHook,
        getEntryUrl,
        resourceContext,
      });
  }
```

Add at the end of `load.ts`:

```ts
export const __loadEntryDomForTest = loadEntryDom;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @module-federation/runtime-core test` (scoped to the new file).
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/runtime-core/src/utils/load.ts packages/runtime-core/src/utils/__tests__/load-entry-fetch-options.spec.ts
git commit -m "feat(runtime-core): route ESM remotes with fetchOptions to blob loader"
```

---

## Task 5: Authenticate the manifest fetch

**Files:**
- Modify: `packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts:306-321`
- Test: extend an existing SnapshotHandler test or add `packages/runtime-core/src/plugins/snapshot/__tests__/manifest-fetch-options.spec.ts`

- [ ] **Step 1: Apply the change**

In `getManifestJson` (`SnapshotHandler.ts`), `remoteInfo` is already in scope (built at line 300 via `getRemoteInfo(moduleInfo)`). Replace the `{}` request options at lines 307-320:

```ts
        let res = await this.loaderHook.lifecycle.fetch.emit(
          manifestUrl,
          remoteInfo.fetchOptions ?? {},
          remoteInfo,
          resourceOptions
            ? {
                ...resourceOptions,
                url: manifestUrl,
                resourceType: 'manifest',
              }
            : undefined,
        );
        if (!res || !(res instanceof Response)) {
          res = await fetch(manifestUrl, remoteInfo.fetchOptions ?? {});
        }
```

- [ ] **Step 2: Write the test**

```ts
// packages/runtime-core/src/plugins/snapshot/__tests__/manifest-fetch-options.spec.ts
import { ModuleFederation } from '../../../core';

describe('manifest fetch carries fetchOptions', () => {
  it('passes the remote fetchOptions to the fetch hook and native fallback', async () => {
    const fetchOptions = { headers: { Authorization: 'Bearer t' } };
    const manifest = {
      id: 'sub', name: 'sub',
      metaData: {
        name: 'sub', type: 'app', buildInfo: { buildVersion: '1' }, globalName: 'sub',
        remoteEntry: { name: 'remoteEntry.js', path: '', type: 'module' },
        types: { path: '', name: '' }, buildVersion: '1', publicPath: 'http://x/',
        ssrPublicPath: '', remotes: [], shared: [],
      },
      shared: [], remotes: [], exposes: [],
    };
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify(manifest), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    (global as any).fetch = fetchMock;

    const mf = new ModuleFederation({ name: 'host', remotes: [] });
    mf.registerRemotes([{ name: 'sub', entry: 'http://x/mf-manifest.json' } as any], { fetchOptions });

    // Trigger manifest load (errors past the fetch are fine for this assertion).
    await mf.loadRemote('sub/thing').catch(() => undefined);

    expect(fetchMock).toHaveBeenCalledWith('http://x/mf-manifest.json', fetchOptions);
  });
});
```

- [ ] **Step 3: Run test to verify it passes**

Run: `pnpm --filter @module-federation/runtime-core test` (scoped to the new file).
Expected: PASS — the native `fetch` fallback receives `fetchOptions`. (If a registered fetch-hook plugin short-circuits, assert on the hook emit args instead.)

- [ ] **Step 4: Commit**

```bash
git add packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts packages/runtime-core/src/plugins/snapshot/__tests__/manifest-fetch-options.spec.ts
git commit -m "feat(runtime-core): authenticate manifest fetch with remote fetchOptions"
```

---

## Task 6: Route manifest CSS through the blob loader when `fetchOptions` present

**Files:**
- Modify: `packages/runtime-core/src/utils/preload.ts` (imports, `preloadAssets` CSS loops ~lines 275-308, new `waitForCssFetch` helper)
- Test: `packages/runtime-core/src/utils/__tests__/preload-css-fetch-options.spec.ts`

- [ ] **Step 1: Add the import**

At the top of `packages/runtime-core/src/utils/preload.ts`, add `loadCssWithFetch` to the existing `@module-federation/sdk` import (and `createLink`/`createScript` stay). Example:

```ts
import { createLink, createScript, loadCssWithFetch } from '@module-federation/sdk';
```

(Adjust to match the file's actual existing import statement.)

- [ ] **Step 2: Add a header-authenticated CSS helper**

Add near `waitForLinkPreload` in `preload.ts`:

```ts
// When the remote carries fetchOptions, CSS must be fetched WITH headers and
// injected as a blob <link> — a native <link href> cannot carry headers, and a
// rel=preload hint would 401. Mirrors loadCss in the loader PoC.
function waitForCssFetch({
  host,
  remoteInfo,
  url,
  context,
}: {
  host: ModuleFederation;
  remoteInfo: RemoteInfo;
  url: string;
  context: ResourceLoadContext;
}): Promise<PreloadAssetResult> {
  return loadCssWithFetch({
    href: url,
    fetchOptions: remoteInfo.fetchOptions,
    customFetch: (u, init) => host.loaderHook.lifecycle.fetch.emit(u, init, remoteInfo),
  })
    .then(() => createAssetResult(context, url, 'success'))
    .catch((error) =>
      createAssetResult(context, url, isTimeoutError(error) ? 'timeout' : 'error', error),
    );
}
```

- [ ] **Step 3: Use it for CSS when `fetchOptions` present**

In `preloadAssets`, gate the `cssAssets` handling. Replace the two `cssAssets.forEach(...)` blocks (lines ~280-307) so that when `remoteInfo.fetchOptions` is set, CSS goes through `waitForCssFetch`; otherwise the existing `waitForLinkPreload` paths are kept verbatim:

```ts
    if (remoteInfo.fetchOptions) {
      cssAssets.forEach((cssUrl) => {
        results.push(
          waitForCssFetch({
            host,
            remoteInfo,
            url: cssUrl,
            context: createResourceContext(baseContext, 'css'),
          }),
        );
      });
    } else if (useLinkPreload) {
      const defaultAttrs = { rel: 'preload', as: 'style' };
      cssAssets.forEach((cssUrl) => {
        results.push(
          waitForLinkPreload({
            host,
            remoteInfo,
            url: cssUrl,
            attrs: defaultAttrs,
            context: createResourceContext(baseContext, 'css'),
          }),
        );
      });
    } else {
      const defaultAttrs = { rel: 'stylesheet', type: 'text/css' };
      cssAssets.forEach((cssUrl) => {
        results.push(
          waitForLinkPreload({
            host,
            remoteInfo,
            url: cssUrl,
            attrs: defaultAttrs,
            needDeleteLink: false,
            context: createResourceContext(baseContext, 'css'),
          }),
        );
      });
    }
```

Leave the `jsAssetsWithoutEntry` blocks unchanged (those JS chunks are loaded through the blob graph via the entry's `__mfDyn`, so they already carry headers; preloading them as header-less hints is harmless and out of scope to change here).

- [ ] **Step 4: Write the test**

```ts
// packages/runtime-core/src/utils/__tests__/preload-css-fetch-options.spec.ts
const loadCssWithFetch = jest.fn().mockResolvedValue(undefined);
jest.mock('@module-federation/sdk', () => {
  const actual = jest.requireActual('@module-federation/sdk');
  return { ...actual, loadCssWithFetch: (...args: any[]) => loadCssWithFetch(...args) };
});

import { preloadAssets } from '../preload';

describe('preloadAssets CSS with fetchOptions', () => {
  it('routes manifest CSS through the blob loader when fetchOptions is set', async () => {
    const remoteInfo: any = {
      name: 'a', entry: 'http://x/e.js', type: 'module', entryGlobalName: 'a',
      shareScope: 'default', fetchOptions: { headers: { Authorization: 'Bearer t' } },
    };
    const host: any = {
      options: { inBrowser: true },
      loaderHook: { lifecycle: { fetch: { emit: jest.fn() } } },
    };
    const assets: any = { cssAssets: ['http://x/a.css'], jsAssetsWithoutEntry: [], entryAssets: [] };
    await preloadAssets(remoteInfo, host, assets, false);
    expect(loadCssWithFetch).toHaveBeenCalledWith(
      expect.objectContaining({ href: 'http://x/a.css', fetchOptions: remoteInfo.fetchOptions }),
    );
  });
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @module-federation/runtime-core test` (scoped to the new file).
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/runtime-core/src/utils/preload.ts packages/runtime-core/src/utils/__tests__/preload-css-fetch-options.spec.ts
git commit -m "feat(runtime-core): fetch manifest CSS with headers for fetchOptions remotes"
```

---

## Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm `fetchOptions` survives manifest resolution**

Read `packages/runtime-core/src/plugins/snapshot/index.ts:18-38` (`assignRemoteInfo`). It mutates `remoteInfo` in place, setting only `type`, `entryGlobalName`, `entry`, `version`, `buildVersion` — it does NOT touch `fetchOptions`, so the field set in `getRemoteInfo` survives. No code change needed; this step just verifies the assumption still holds.

- [ ] **Step 2: Build the two packages**

Run: `pnpm exec turbo run build --filter=@module-federation/sdk --filter=@module-federation/runtime-core --concurrency=8`
Expected: both build successfully.

- [ ] **Step 3: Lint**

Run: `pnpm --filter @module-federation/sdk lint && pnpm --filter @module-federation/runtime-core lint`
Expected: no errors (fix any from the new files).

- [ ] **Step 4: Run the full test suites for both packages**

Run: `pnpm --filter @module-federation/sdk test && pnpm --filter @module-federation/runtime-core test`
Expected: all green, including the new specs.

- [ ] **Step 5: Add a changeset**

Run: `pnpm changeset` and select `@module-federation/sdk` and `@module-federation/runtime-core` as `minor` (new feature, backward compatible). Describe: "Add per-remote `fetchOptions` to `registerRemotes` enabling header-authenticated ESM remote loading via a fetch+blob loader."

- [ ] **Step 6: Commit**

```bash
git add .changeset
git commit -m "chore: changeset for fetchOptions ESM remote loading"
```

---

## Notes / follow-ups (out of scope here)

- `system` (SystemJS) and IIFE/global remotes: only the manifest is authenticated for these; header-carrying chunk loads need separate work (SystemJS loader override / webpack publicPath interception).
- CSS imported from inside JS (`import './x.css'`) is not handled by the rewriter (it only rewrites JS module specifiers); not exercised by the targeted ESM manifests.
- The regex-based rewriter is kept as-is from the PoC — acceptable for bundler ESM output, but note it is not a full JS parser.
