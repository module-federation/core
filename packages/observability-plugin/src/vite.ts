import type { Plugin } from 'vite';
import {
  ObservabilityVitePlugin as createObservabilityVitePlugin,
  type ObservabilityVitePluginOptions,
} from './build';

export type { ObservabilityVitePluginOptions };
export type ObservabilityVitePluginResult = Plugin;

export function ObservabilityVitePlugin(
  options: ObservabilityVitePluginOptions = {},
): Plugin {
  return createObservabilityVitePlugin(options);
}
