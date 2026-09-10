import { createObservability } from './core';
import type {
  ObservabilityPluginOptions,
  ObservabilityRuntimePlugin,
} from './type';

export type { ObservabilityPluginOptions } from './type';

export function ObservabilityPlugin(
  options: ObservabilityPluginOptions = {},
): ObservabilityRuntimePlugin {
  return createObservability(options).plugin;
}

export default ObservabilityPlugin;
