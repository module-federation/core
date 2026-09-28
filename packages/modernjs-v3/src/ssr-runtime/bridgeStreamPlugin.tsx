import type { RuntimePlugin } from '@modern-js/runtime';
import type { BridgeServiceOptions } from '../types';

export interface BridgeStreamPluginOptions {
  timeoutMs?: number;
  services?: Record<string, BridgeServiceOptions>;
}

/** Modern's server extension alias selects bridgeStreamPlugin.node at build time. */
export function bridgeStreamPlugin(
  _options: BridgeStreamPluginOptions = {},
): RuntimePlugin {
  return { name: '@module-federation/bridge-stream', setup() {} };
}
