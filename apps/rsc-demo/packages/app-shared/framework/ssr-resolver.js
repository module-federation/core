'use strict';

/**
 * Federated SSR component resolver.
 *
 * Registry sources (in priority order):
 * 1. globalThis.__RSC_SSR_REGISTRY__ - set by worker preload or runtime plugin
 * 2. globalThis.__RSC_SSR_REGISTRY_INJECTED__ - build-time injection from react-ssr-manifest.json
 *
 * Falls back to webpack require + no-op component if registry is missing.
 */

let registryCache = null;
let resolverInstalled = false;

function wrapSSRModule(mod, info) {
  if (!mod) {
    const ref = info?.request || info?.moduleId || 'unknown';
    throw new Error(
      `[RSC-SSR] Failed to resolve client reference for SSR: ${ref}`
    );
  }

  // Some SSR loader / CJS interop cases can yield a callable export without a
  // `default` property, while the client manifest expects `default`.
  if (typeof mod === 'function') {
    mod = {__esModule: true, default: mod};
  }

  if (typeof mod !== 'object') return mod;

  const moduleId = info?.moduleId || 'unknown';
  const request = info?.request || moduleId;
  const expectedExports = new Set(
    Array.isArray(info?.exports)
      ? info.exports.filter((e) => e && e !== '*')
      : []
  );
  // React's default export path reads `moduleExports.__esModule` + `moduleExports.default`.
  expectedExports.add('default');

  try {
    return new Proxy(mod, {
      get(target, prop) {
        if (prop === '__esModule')
          return target.__esModule === undefined ? true : target.__esModule;
        if (prop === 'then') return undefined; // avoid thenable detection
        if (typeof prop === 'symbol') return target[prop];

        if (prop in target) {
          const value = target[prop];
          if (
            typeof prop === 'string' &&
            expectedExports.has(prop) &&
            value === undefined
          ) {
            throw new Error(
              `[RSC-SSR] Export "${prop}" resolved to undefined for module "${moduleId}" (request: "${request}")`
            );
          }
          return value;
        }

        if (typeof prop === 'string' && expectedExports.has(prop)) {
          throw new Error(
            `[RSC-SSR] Missing export "${prop}" for module "${moduleId}" (request: "${request}")`
          );
        }
        return undefined;
      },
    });
  } catch (_e) {
    // Best-effort fallback when Proxy isn't available.
    return mod;
  }
}

function loadRSCRegistry() {
  // 1. Return cached registry if available
  if (registryCache) return registryCache;

  // 2. Check globalThis (set by worker preload or runtime plugin)
  if (globalThis.__RSC_SSR_REGISTRY__) {
    registryCache = globalThis.__RSC_SSR_REGISTRY__;
    return registryCache;
  }

  // 3. Check build-time injected registry (injected into globalThis by injectSSRRegistry)
  if (globalThis.__RSC_SSR_REGISTRY_INJECTED__) {
    const injected = globalThis.__RSC_SSR_REGISTRY_INJECTED__;
    if (
      injected &&
      typeof injected === 'object' &&
      Object.keys(injected).length
    ) {
      registryCache = injected;
      globalThis.__RSC_SSR_REGISTRY__ = registryCache;
      return registryCache;
    }
  }

  // No registry available - SSR will use webpack require only
  return null;
}

function normalizeId(moduleId) {
  if (typeof moduleId !== 'string') return moduleId;

  // If the id already has an explicit layer prefix, keep it as-is.
  if (moduleId.startsWith('(ssr)/') || moduleId.startsWith('(client)/')) {
    return moduleId;
  }

  const match = moduleId.match(/\(client\)\/(.+)/);
  const id = match ? match[1] : moduleId;
  return id.startsWith('./') ? id : `./${id}`;
}

/**
 * Install a global __webpack_require__ that can resolve client references
 * emitted by the React Flight stream during SSR.
 */
function installFederatedSSRResolver() {
  if (resolverInstalled) return;

  // Capture the webpack require created by the SSR bundle.
  const webpackRequire =
    typeof __webpack_require__ === 'function' ? __webpack_require__ : null;

  // Registry injected by runtime plugin (may still be null during very early init)
  const registry = loadRSCRegistry() || {};

  // noop chunk loader (SSR never loads additional chunks)
  globalThis.__webpack_chunk_load__ = () => Promise.resolve();

  globalThis.__webpack_require__ = function federatedSSRRequire(moduleId) {
    const normalizedId = normalizeId(moduleId);
    const ssrToClient =
      typeof normalizedId === 'string'
        ? normalizedId.replace(/^\(ssr\)\//, '(client)/')
        : normalizedId;
    const entry =
      registry[moduleId] ||
      registry[normalizedId] ||
      registry[ssrToClient] ||
      registry[
        typeof normalizedId === 'string'
          ? normalizedId.replace(/^\(ssr\)/, '(client)')
          : normalizedId
      ] ||
      registry[
        typeof normalizedId === 'string'
          ? `(client)/${normalizedId.replace(/^\.\//, '')}`
          : normalizedId
      ];
    const expectedExports = entry?.exports;

    // Fast path: try webpack module id directly
    if (webpackRequire) {
      for (const candidate of [moduleId, normalizedId]) {
        if (typeof candidate !== 'string') continue;
        try {
          return wrapSSRModule(webpackRequire(candidate), {
            moduleId,
            request: candidate,
            exports: expectedExports,
          });
        } catch (_e) {
          // continue to next candidate
        }
      }
    }

    // Registry lookup (helps when manifest id doesn't match webpack id exactly)
    if (entry && webpackRequire) {
      const request = entry.ssrRequest || entry.request || normalizedId;
      try {
        return wrapSSRModule(webpackRequire(request), {
          moduleId,
          request,
          exports: expectedExports,
        });
      } catch (_e) {
        // fall through to fallback
      }
    }

    throw new Error(
      `[RSC-SSR] Failed to resolve client reference for SSR: ${String(moduleId)}`
    );
  };

  globalThis.__webpack_require__.__isFederatedSSRResolver = true;
  resolverInstalled = true;
}

module.exports = {
  installFederatedSSRResolver,
};
