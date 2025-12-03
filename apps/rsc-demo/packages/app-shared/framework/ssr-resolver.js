'use strict';

/**
 * Federated SSR component resolver.
 *
 * Uses the registry set on globalThis.__RSC_SSR_REGISTRY__ by ssr-entry.js
 * (loaded from mf-manifest.json at runtime) and merged with remote components
 * by rscSSRRuntimePlugin's loadSnapshot hook.
 *
 * No build-time injection needed. Falls back to a no-op component if registry
 * is missing to keep SSR resilient.
 */

let registryCache = null;
let resolverInstalled = false;

function loadRSCRegistry() {
  if (registryCache) return registryCache;
  if (globalThis.__RSC_SSR_REGISTRY__) {
    registryCache = globalThis.__RSC_SSR_REGISTRY__;
    return registryCache;
  }
  return null;
}

function normalizeId(moduleId) {
  if (typeof moduleId !== 'string') return moduleId;
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

    // Fast path: try webpack module id directly
    if (webpackRequire) {
      try {
        return webpackRequire(normalizedId);
      } catch (_e) {
        // continue to registry lookup
      }
    }

    // Registry lookup (helps when manifest id doesn't match webpack id exactly)
    const entry =
      registry[moduleId] ||
      registry[normalizedId] ||
      registry[`(client)/${normalizedId.replace(/^\.\//, '')}`];

    if (entry && webpackRequire) {
      const request = entry.request || normalizedId;
      try {
        const mod = webpackRequire(request);
        return mod;
      } catch (_e) {
        // fall through to fallback
      }
    }

    // Fallback: render nothing instead of crashing SSR
    // Silent fallback: render nothing instead of crashing SSR
    return {
      __esModule: true,
      default: function PlaceholderComponent() {
        return null;
      },
    };
  };

  globalThis.__webpack_require__.__isFederatedSSRResolver = true;
  resolverInstalled = true;
}

module.exports = {
  installFederatedSSRResolver,
};
