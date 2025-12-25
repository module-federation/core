'use strict';

/**
 * SSR Runtime Plugin
 *
 * The host's registry is loaded at runtime by ssr-entry.js from mf-manifest.json.
 * This plugin merges remote component registries when loadSnapshot is called.
 */

function rscSSRRuntimePlugin() {
  let registryInitialized = false;

  function initializeRegistry() {
    if (registryInitialized) return;
    registryInitialized = true;

    // Ensure registry exists (ssr-entry.js should have set it already)
    globalThis.__RSC_SSR_REGISTRY__ = globalThis.__RSC_SSR_REGISTRY__ || {};

    // Also check for preloaded manifest (legacy/manual preload support)
    if (globalThis.__RSC_SSR_MANIFEST__) {
      const registry =
        globalThis.__RSC_SSR_MANIFEST__?.additionalData?.rsc
          ?.clientComponents ||
        globalThis.__RSC_SSR_MANIFEST__?.rsc?.clientComponents ||
        null;
      if (registry) {
        Object.assign(globalThis.__RSC_SSR_REGISTRY__, registry);
      }
    }
  }

  function mergeRegistryFrom(manifestJson) {
    if (!manifestJson) return;
    const registry =
      manifestJson?.additionalData?.rsc?.clientComponents ||
      manifestJson?.rsc?.clientComponents ||
      null;
    if (registry) {
      // Merge remote components into existing registry
      globalThis.__RSC_SSR_REGISTRY__ = globalThis.__RSC_SSR_REGISTRY__ || {};
      Object.assign(globalThis.__RSC_SSR_REGISTRY__, registry);
    }
  }

  return {
    name: 'rsc-ssr-runtime-plugin',
    beforeInit(args) {
      // Ensure the host registry exists; ssr-worker or server startup preloads it.
      initializeRegistry();
      return args;
    },
    async loadRemoteSnapshot(args) {
      // Merge remote components from loaded manifests
      mergeRegistryFrom(args.manifestJson);
      return args;
    },
  };
}

module.exports = rscSSRRuntimePlugin;
module.exports.default = rscSSRRuntimePlugin;
