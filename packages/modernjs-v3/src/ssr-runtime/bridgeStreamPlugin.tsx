import type { RuntimePlugin } from '@modern-js/runtime';

export interface BridgeStreamPluginOptions {
  timeoutMs?: number;
}

/** Modern's server extension alias selects bridgeStreamPlugin.node at build time. */
export function bridgeStreamPlugin(
  _options: BridgeStreamPluginOptions = {},
): RuntimePlugin {
  return { name: '@module-federation/bridge-stream', setup() {} };
}
