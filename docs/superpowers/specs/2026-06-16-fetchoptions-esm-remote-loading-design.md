# `fetchOptions` for header-authenticated ESM remote loading

**Date:** 2026-06-16
**Status:** Approved design — pending implementation plan
**Related:** https://github.com/module-federation/enhanced/issues/15
**PoC:** `js-module-import/index.html` (fetch + blob import-rewriting loader)

## Problem

Native `<script src>` and native `import()` cannot carry custom HTTP headers. A
compliance use case requires an `Authorization: Bearer …` header (plus arbitrary
`X-*` headers) on **every** asset request a remote pulls in: the manifest, the
remote entry, split chunks, and shared dependencies.

Today the Module Federation runtime:

- fetches the **manifest** through the `loaderHook.lifecycle.fetch` hook — the
  only place headers can already be injected — but passes `{}` as the request
  options (`SnapshotHandler.ts:307`);
- loads the **remote entry** via a native `<script>` tag
  (`loadEntryScript` → `sdk/src/dom.ts`) or native `import()`
  (`loadEsmEntry`), neither of which can carry headers;
- loads **split chunks and shared deps** via the bundler runtime
  (webpack/rspack `__webpack_require__.l`, or native `import()` for ESM output),
  which the MF runtime does not intercept at all.

There is therefore no way today — via plugin or config — to attach headers to
the actual JS module graph. A runtime plugin alone is insufficient because
(a) there is no channel to pass per-remote fetch options from the API down to
the loader, and (b) the `fetch` hook is emitted only for the manifest.

## Why the PoC works

The PoC sidesteps the bundler's header-less loading entirely. It `fetch`es each
module's **source text** (headers attached), rewrites every static and dynamic
`import` to recursively-loaded **blob URLs**, then imports the blob. Because the
whole graph becomes blob imports driven by an explicit `fetch`, the bundler
never performs a native header-less load. This works when the remote is built as
**ES modules** — where all loading is `import` / `import()`. It does not reach
IIFE / webpack-JSONP chunk loads (`__webpack_require__.l`), so those remain out
of scope for this iteration.

## Scope

**In scope (this iteration):**

- A per-remote `fetchOptions: RequestInit` passed through `registerRemotes`.
- Authenticated manifest fetch.
- A fetch + blob ESM loader (hardened port of the PoC) used for `module` / `esm`
  remotes that carry `fetchOptions`: entry + all chunks + shared deps.
- Authenticated loading of **CSS assets declared in `mf-manifest.json`** (fetch
  the CSS text with headers, inject as a blob `<link>`).

**Out of scope (follow-ups):**

- `loadSystemJsEntry` (`system`) and `loadEntryScript` (IIFE/global) remotes —
  header-carrying chunk loads for these formats. For non-ESM remotes with
  `fetchOptions`, only the manifest is authenticated this iteration.
- CSS imported from inside JS (`import './x.css'`) — not exercised by the PoC
  and not part of the ESM manifests we target.
- **JS preload hints** (`jsAssetsWithoutEntry` in `preloadAssets`): these emit
  header-less `<link rel="preload" as="script">` hints. For `fetchOptions`
  remotes those hints will 401, but they are harmless — the actual chunk/shared
  loads run through the authenticated blob graph (`__mfDyn`), exactly like the
  PoC's suppressed `vite:preloadError` hints. Suppressing the wasted hints is a
  possible future cleanup, not a correctness fix.
- **`createLink` lifecycle hook for authenticated CSS:** `loadCssWithFetch`
  injects the blob `<link>` directly and does not emit the `createLink` hook, so
  plugins that add CSP `nonce`/SRI attributes do not run for `fetchOptions` CSS.
  Threading the hook into the sdk loader is a follow-up; unauthenticated CSS
  still uses the hook.

## Decisions

- **ESM-only, inferred from the manifest.** The entry type comes from
  `metaData.remoteEntry.type` in `mf-manifest.json` (flows to `remoteInfo.type`).
  The fetch + blob loader is engaged only in the existing `case 'esm' / 'module'`
  branch of `loadEntryDom`. Any non-ESM remote never reaches that branch and so
  automatically falls back to today's loader unchanged.
- **Per-remote `fetchOptions`.** Different headers for different remotes are
  expressed by calling `registerRemotes([...], { fetchOptions })` multiple times
  (e.g. `[remote1, remote2]` with one set, `[remote3, remote4]` with another).
  `fetchOptions` is stamped onto each `Remote` in that call inside
  `registerRemotes` (plural). There is no reliance on a singular public
  `registerRemote`.
- **Ported PoC code keeps its original comments.** The explanatory comments in
  `js-module-import/index.html` are carried over verbatim where the code is
  ported.
- **Backward compatible.** Every new field is optional; with no `fetchOptions`,
  all existing behavior is byte-for-byte unchanged.

## Design

### 1. API + type plumbing (`runtime-core`, `sdk`)

- Extend the `registerRemotes` options:
  `registerRemotes(remotes: Remote[], options?: { force?: boolean; fetchOptions?: RequestInit }): void`.
  In the plural method, iterate the array and stamp `fetchOptions` onto each
  remote before delegating to the existing internal registration.
- Add `fetchOptions?: RequestInit` to the shared `Remote` type
  (`RemoteInfoCommon`) and to `RemoteInfo` (`runtime-core/src/type/config.ts`).
- Carry it through `getRemoteInfo` (`runtime-core/src/utils/load.ts:393`) so it
  lands on `RemoteInfo`. Manifest-driven `assignRemoteInfo`
  (`plugins/snapshot/index.ts`) must preserve it (it overwrites `type`, not
  `fetchOptions`).

### 2. Authenticated manifest fetch (`runtime-core`, tiny)

In `SnapshotHandler.ts` (~line 307) `remoteInfo` is already in scope. Change the
hook emit options `{}` → `remoteInfo.fetchOptions ?? {}`, and the native
fallback `fetch(manifestUrl, {})` → `fetch(manifestUrl, remoteInfo.fetchOptions ?? {})`.
The manifest is then authenticated with no plugin required.

### 3. Fetch + blob ESM loader (`sdk` — new `packages/sdk/src/blobLoad.ts`)

A hardened port of the PoC. Public surface:

```ts
loadEsmEntryWithFetch({
  entry: string,
  remoteInfo: RemoteInfo,          // supplies fetchOptions
  loaderHook: ModuleFederation['loaderHook'],
}): Promise<RemoteEntryExports>

loadCssWithFetch({
  href: string,
  remoteInfo: RemoteInfo,
  loaderHook: ModuleFederation['loaderHook'],
}): Promise<void>
```

Internals (ported from the PoC, comments retained):

- `fetcher(url)` — emits `loaderHook.lifecycle.fetch` (so existing fetch-hook
  plugins still compose) with `remoteInfo.fetchOptions` merged in; falls back to
  native `fetch(url, merged)`. Returns response text. Throws a descriptive
  network error (mirroring the `ScriptNetworkError` messaging in `dom.ts`) on a
  non-OK response.
- `resolveSpec(spec, base)` — PoC logic verbatim (relative / absolute-path /
  absolute-url; bare specifiers throw).
- `loadModule(url)` — PoC logic: instance-scoped cache (`Map<url, Promise<blobUrl>>`),
  rewrite `import.meta.url` → the real url, dynamic `import(` → `__mfDyn("<url>",`,
  static `from`/`import '…'` relative/absolute specifiers → recursively-loaded
  blob URLs, then `URL.createObjectURL`.
- `globalThis.__mfDyn` — runtime dynamic-import shim, installed idempotently
  (guard so repeated remote loads don't reinstall).
- The `vite:preloadError` listener from the PoC is added once (idempotent) so
  native preload hints fail quietly.

Hardening over the raw PoC: idempotent global install, instance-scoped cache,
and unified error messaging — but the regex-based rewriting is kept as-is, which
is acceptable for the ESM build output we target.

### 4. Routing + ESM gate (`runtime-core`)

In `loadEntryDom` (`runtime-core/src/utils/load.ts:189`), the
`case 'esm' / 'module'` branch becomes:

```ts
case 'esm':
case 'module':
  return remoteInfo.fetchOptions
    ? loadEsmEntryWithFetch({ entry, remoteInfo, loaderHook })
    : loadEsmEntry({ entry, remoteEntryExports });
```

`system` and the default (`loadEntryScript`) branches are untouched.

### 5. Authenticated manifest CSS (`runtime-core`)

CSS assets declared in the manifest are preloaded today via `createLink` in
`runtime-core/src/utils/preload.ts` (`waitForLinkPreload`). When the owning
remote carries `fetchOptions`, route those CSS loads through `loadCssWithFetch`
instead of a native `<link href>` — fetch the CSS text with headers and inject a
blob `<link>`. The exact injection point in `preload.ts` (and access to the
remote's `fetchOptions` there) is confirmed during implementation; the loader
helper itself lives in `sdk/blobLoad.ts`.

### 6. Error handling

`loadEsmEntryWithFetch` / `loadCssWithFetch` reject with descriptive errors.
`getRemoteEntry`'s existing `loadEntryError` hook continues to apply, so retry
plugins keep working.

## Testing

- **Unit (`sdk`):** the import rewriter (static, dynamic, `import.meta.url`
  cases), `resolveSpec` (relative / absolute / bare-throws), cache reuse, and the
  `fetcher` header-merge precedence.
- **Integration:** register an ESM remote with `fetchOptions`, load it, assert
  the headers reach the manifest fetch, the entry fetch, a dynamically-imported
  chunk, and a shared dep.
- **Fallback:** a non-ESM remote with `fetchOptions` is loaded via the original
  path (loader untouched); an ESM remote without `fetchOptions` uses
  `loadEsmEntry` unchanged.
- **CSS:** a manifest-declared CSS asset on a `fetchOptions` remote is fetched
  with headers and injected as a blob `<link>`.

## Files touched (anticipated)

- `packages/sdk/src/blobLoad.ts` — **new**; fetch + blob loader + CSS helper.
- `packages/sdk/src/types/…` — `fetchOptions` on the shared remote types;
  export the new loader.
- `packages/runtime-core/src/type/config.ts` — `fetchOptions` on `Remote` /
  `RemoteInfo`.
- `packages/runtime-core/src/remote/index.ts` — `registerRemotes` options +
  stamping.
- `packages/runtime-core/src/utils/load.ts` — `getRemoteInfo` passthrough +
  `loadEntryDom` routing gate.
- `packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts` — manifest
  fetch options.
- `packages/runtime-core/src/plugins/snapshot/index.ts` — preserve `fetchOptions`
  in `assignRemoteInfo`.
- `packages/runtime-core/src/utils/preload.ts` — route manifest CSS through the
  fetch + blob helper when `fetchOptions` present.
- Tests alongside the above.
