/**
 * SSR Runtime Plugin
 *
 * The host's registry is loaded at runtime by ssr-entry.js from mf-manifest.json.
 * This plugin merges remote component registries when loadSnapshot is called.
 */

export default function rscSSRRuntimePlugin() {
  let registryInitialized = false;

  async function fetchJson(url: string): Promise<any | null> {
    if (typeof fetch !== 'function') return null;
    try {
      const res = await fetch(url);
      if (!res || !res.ok) return null;
      return await res.json();
    } catch (_e) {
      return null;
    }
  }

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

  function resolveSsrManifestUrl(manifestJson, manifestUrl) {
    const candidate =
      manifestJson?.additionalData?.rsc?.ssrManifest ||
      manifestJson?.rsc?.ssrManifest ||
      null;
    if (!candidate || typeof candidate !== 'string') return null;
    if (candidate.startsWith('http')) return candidate;
    if (manifestUrl && typeof manifestUrl === 'string') {
      try {
        return new URL(candidate, manifestUrl).href;
      } catch (_e) {
        return null;
      }
    }
    return candidate;
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

      const layer =
        args?.manifestJson?.additionalData?.rsc?.layer ||
        args?.manifestJson?.rsc?.layer;
      const needsSsrManifest = layer && layer !== 'ssr';
      if (needsSsrManifest) {
        const ssrManifestUrl = resolveSsrManifestUrl(
          args.manifestJson,
          args.manifestUrl,
        );
        if (ssrManifestUrl) {
          const ssrManifest = await fetchJson(ssrManifestUrl);
          mergeRegistryFrom(ssrManifest);
        }
      }

      return args;
    },
  };
}
