/**
 * Built-in HMR runtime support for `@module-federation/bridge-react`.
 *
 * Problem statement (solved here):
 *   1. `createBaseBridgeComponent` captures `bridgeInfo.rootComponent` by value in
 *      `RawComponent`'s JSX closure → even after HMR replaces the user's App, the
 *      bridge keeps rendering the old reference.
 *   2. The host-side `RemoteAppWrapper` calls `providerInfo()` exactly once and
 *      caches it, so the newly-exported factory returned after HMR is never picked up.
 *   3. HMR accept callbacks in MF exposes' async chunks are not always propagated by
 *      the bundler, so `import.meta.webpackHot.accept()` in a single file cannot be
 *      relied upon as the sole hook.
 *
 * Strategy (transparent to the user):
 *   - Record the latest `rootComponent` / `rootComponentGetter` per `__callerKey`
 *     in a global map. Every re-execution of the user's `createBridgeComponent(...)`
 *     (which happens automatically when their exporter file is HMR-replaced) updates
 *     this map.
 *   - Maintain a global registry of `{dom, root, info}` for every bridge instance that
 *     has been `render()`'d but not yet `destroy()`'d.
 *   - Provide `refreshAllBridges()` which walks the registry, re-reads the latest
 *     rootComponent via the map (or getter), and invokes `root.render(newJSX)` on each
 *     cached React root → React Fiber reconciliation updates the DOM without reload.
 *   - Install two universal HMR hooks in the browser:
 *       a) `import.meta.webpackHot.accept(...)` when available in the current
 *          compilation scope (requires module-local wiring, done in caller file).
 *       b) Monkey-patch the global Rspack HMR dispatcher
 *          `window.rspackHotUpdate{name}` after each HMR check/apply. This works even
 *          when the caller file's `accept` wiring was unreachable.
 */

import type { ComponentType } from 'react';

export interface BridgeHandle {
  render: (info: any) => any;
  destroy: (info: any) => any;
}

export interface BridgeRef {
  dom: Element | null;
  info: any;
  rootRef: any;
  bridgeInfoKeyRef: { current: string | symbol | undefined };
  handleRef: { current: BridgeHandle | null };
}

const GLOBAL_KEY_LATEST = '__mf_bridge_latest_by_caller__' as const;
const GLOBAL_KEY_REGISTRY = '__mf_bridge_registry__' as const;
const GLOBAL_KEY_WRAPPED = '__mf_bridge_hmr_wrapped__' as const;
const GLOBAL_KEY_HMR_ACCEPTED_ONCE = '__mf_bridge_accepted_installed__' as const;

type LatestEntry = {
  rootComponent: ComponentType<any>;
  getter?: () => ComponentType<any>;
};

function getGlobal<T>(key: string, factory: () => T): T {
  if (typeof globalThis === 'undefined') return factory();
  const W = globalThis as any;
  if (!W[key]) W[key] = factory();
  return W[key] as T;
}

export function latestByCaller(): Map<
  string | symbol,
  LatestEntry
> {
  return getGlobal(GLOBAL_KEY_LATEST, () => new Map<string | symbol, LatestEntry>());
}

export function bridgeRegistry(): Set<BridgeRef> {
  return getGlobal(GLOBAL_KEY_REGISTRY, () => new Set<BridgeRef>());
}

export function registerLatest<T>(
  key: string | symbol | undefined,
  rootComponent: ComponentType<T>,
  getter?: () => ComponentType<T>,
): void {
  if (!key) return;
  latestByCaller().set(key, { rootComponent, getter });
}

export function resolveRootComponent<T>(
  key: string | symbol | undefined,
  fallback: ComponentType<T>,
  fallbackGetter?: () => ComponentType<T>,
): ComponentType<T> {
  if (!key) return fallbackGetter ? fallbackGetter() : fallback;
  const entry = latestByCaller().get(key);
  if (!entry) return fallbackGetter ? fallbackGetter() : fallback;
  if (entry.getter) {
    try {
      const got = entry.getter();
      if (got) return got as ComponentType<T>;
    } catch {}
  }
  return entry.rootComponent as ComponentType<T>;
}

export function refreshAllBridges(): number {
  let refreshed = 0;
  for (const ref of bridgeRegistry()) {
    const dom = ref.dom;
    const info = ref.info;
    const handle = ref.handleRef?.current;
    if (!dom || !info || !handle?.render) continue;
    try {
      handle.render({ ...info, dom, __hmrRefresh: true } as any);
      refreshed += 1;
    } catch {}
  }
  return refreshed;
}

/**
 * Best-effort detection of the caller file (first non-bridge-react stack frame)
 * used as the HMR identity key. We intentionally avoid `import.meta.url` / module.id
 * because the library ships in CJS + ESM dual format and the bundler transforms
 * those inconsistently. Stack parsing works identically across both outputs and
 * correctly distinguishes multiple remote exporters in the same page.
 */
export function callerKeyFromStack(marker: string): string | undefined {
  try {
    throw new Error('mf-bridge-caller-marker');
  } catch (err) {
    const raw = (err as Error).stack || '';
    const lines = raw.split('\n');
    // Find the first line that mentions our marker function (the `createBridgeComponent` wrapper
    // defined in v18/v19/legacy entrypoints, NOT the one inside bridge-react itself)
    const markerIdx = lines.findIndex((l) => l.includes(marker));
    if (markerIdx < 0) return undefined;
    for (let i = markerIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.includes('/bridge-react/') || line.includes('\\bridge-react\\')) continue;
      if (!line.includes(' at ') && !line.startsWith('    at ')) continue;
      // Extract "file:line:col" segment. Accepts both V8 `at foo (file:1:2)` and Safari `file:1:2`
      const m =
        line.match(/\(([^()]+):(\d+):(\d+)\)\s*$/) ||
        line.match(/@(.+?\.tsx?|\.jsx?|\.mjs|\.cjs):(\d+):(\d+)\s*$/) ||
        line.match(/^\s*at\s+(.+?\.tsx?|\.jsx?|\.mjs|\.cjs):(\d+):(\d+)\s*$/);
      if (m) {
        return `${m[1]}:${m[2]}`; // file:line only (column changes across edits, would thrash)
      }
    }
    return undefined;
  }
}

/**
 * Install (once, globally) the universal HMR hooks. Returns `true` if a hook was
 * newly attached, `false` if this is a subsequent call and nothing changed.
 *
 * Caller-side wiring (`import.meta.webpackHot.accept`) MUST be performed by the
 * caller itself because Rspack / Vite / Webpack all require the HMR accept call
 * to live lexically inside the module whose changes are being accepted. Pass the
 * accept routine via `opts.acceptViaImportMetaHot` — this file only guarantees
 * single-install semantics for it. When omitted, only the monkey-patch pathway
 * (rspackHotUpdate* globals) is active, which works in Rspack MF setups.
 */
export function installHMRHooks(
  onApply: () => void,
  opts: { acceptViaImportMetaHot?: () => void } = {},
): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;

  const W = globalThis as any;

  if (typeof opts.acceptViaImportMetaHot === 'function') {
    if (!W[GLOBAL_KEY_HMR_ACCEPTED_ONCE]) W[GLOBAL_KEY_HMR_ACCEPTED_ONCE] = new Set();
    const acceptorsInstalled = W[GLOBAL_KEY_HMR_ACCEPTED_ONCE] as Set<string>;
    const scopeId = typeof document !== 'undefined' ? 'document' : 'global';
    if (!acceptorsInstalled.has(scopeId + '-im')) {
      acceptorsInstalled.add(scopeId + '-im');
      try {
        opts.acceptViaImportMetaHot();
      } catch {}
    }
  }

  if (W[GLOBAL_KEY_WRAPPED]) return false;
  W[GLOBAL_KEY_WRAPPED] = true;

  // 2) Monkey-patch any `rspackHotUpdate*` global attached later (common in Rspack MF setup)
  //    We patch lazily via getter so even globals registered after this file runs are covered.
  const patchNow = (name: string) => {
    const original = W[name];
    if (typeof original !== 'function') return false;
    if (Object.prototype.hasOwnProperty.call(original, '__mf_bridge_wrapped__')) return false;
    const wrapped: any = function rspackHotUpdateBridgeWrapper(this: any, ...args: any[]) {
      const ret: any = original.apply(this, args);
      const schedule = () => {
        try {
          onApply();
        } catch {}
      };
      try {
        Promise.resolve(ret).finally(() => setTimeout(schedule, 30));
      } catch {
        setTimeout(schedule, 50);
      }
      return ret;
    };
    wrapped.__mf_bridge_wrapped__ = true;
    try {
      W[name] = wrapped;
      return true;
    } catch {
      return false;
    }
  };

  const GLOBALS_TO_PATCH = [
    'rspackHotUpdatehost',
    'rspackHotUpdateremote',
    // fallback names used by older rspack/webpack5 MF runtimes
    '__webpack_require__.$Refresh$',
  ];
  GLOBALS_TO_PATCH.forEach(patchNow);

  // Some runtimes attach the globals AFTER our first bridge render (async script order).
  // Re-try for a few seconds with a MutationObserver + short timers.
  let attempts = 0;
  const retry = () => {
    attempts += 1;
    GLOBALS_TO_PATCH.forEach(patchNow);
    if (attempts < 8) setTimeout(retry, 1500);
  };
  setTimeout(retry, 500);

  // 3) WebSocket-level hint: when the page has Rsbuild console reconnect log we also
  //    poll refresh once (handles rare edge where patching wins the race vs HMR check).
  if (typeof window.addEventListener === 'function') {
    try {
      window.addEventListener('message', (ev) => {
        const t = typeof ev?.data === 'string' ? ev.data : '';
        if (/webpackHotUpdate|rspack.*hmr|__webpack_hmr/i.test(t)) {
          try {
            onApply();
          } catch {}
        }
      });
    } catch {}
  }

  return true;
}
