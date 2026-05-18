import type { ObservabilityRuntimePlugin } from './core';
import { createObservability, type ObservabilityPluginOptions } from './core';

export type { ObservabilityPluginOptions } from './core';

export function ObservabilityPlugin(
  options: ObservabilityPluginOptions = {},
): ObservabilityRuntimePlugin {
  return createObservability(options).plugin;
}

export default ObservabilityPlugin;
