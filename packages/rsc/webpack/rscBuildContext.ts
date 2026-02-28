/**
 * Shared build-time plugin state for RSC webpack plugins.
 *
 * Follows the same pattern as Next.js's `getProxiedPluginState` in
 * `packages/next/src/build/build-context.ts`. A module-scoped singleton
 * object behind a Proxy allows multiple plugins to lazily read/write
 * typed state without globalThis mutations or cross-package imports.
 *
 * @see https://github.com/vercel/next.js/blob/canary/packages/next/src/build/build-context.ts
 */

export type ClientManifestJson = Record<string, any>;

let pluginState: Record<string, any> = {};

export function getProxiedPluginState<State extends Record<string, any>>(
  initialState: State,
): State {
  return new Proxy(pluginState, {
    get(target, key: string) {
      if (typeof target[key] === 'undefined') {
        return (target[key] = initialState[key]);
      }
      return target[key];
    },
    set(target, key: string, value) {
      target[key] = value;
      return true;
    },
  }) as State;
}

export function getPluginState() {
  return pluginState;
}

export const rscPluginState = getProxiedPluginState({
  clientManifestRegistry: {} as Record<string, ClientManifestJson>,
});

export function publishClientManifest(
  outputDir: string,
  fileName: string,
  manifest: ClientManifestJson,
): void {
  if (!outputDir || !fileName || !manifest) return;
  const key = `${outputDir}::${fileName}`;
  rscPluginState.clientManifestRegistry[key] = manifest;
}

export function getCachedClientManifest(
  outputDir: string,
  fileName: string,
): ClientManifestJson | null {
  if (!outputDir || !fileName) return null;
  const key = `${outputDir}::${fileName}`;
  return rscPluginState.clientManifestRegistry[key] || null;
}
