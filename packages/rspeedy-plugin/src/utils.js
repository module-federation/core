import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RSPEEDY_RUNTIME_PLUGIN = require.resolve(
  '@module-federation/rspeedy-core-plugin',
);

export function normalizeRuntimePlugins(runtimePlugins = []) {
  const normalized = Array.isArray(runtimePlugins)
    ? runtimePlugins.filter(Boolean)
    : [runtimePlugins];

  // Ensure the rspeedy runtime plugin is always first so it can short-circuit DOM script creation.
  if (!normalized.includes(RSPEEDY_RUNTIME_PLUGIN)) {
    normalized.unshift(RSPEEDY_RUNTIME_PLUGIN);
  }

  return normalized;
}
