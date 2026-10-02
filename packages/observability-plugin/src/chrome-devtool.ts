import { createObservability } from './core';
import type {
  ObservabilityPluginOptions,
  ObservabilityRuntimePlugin,
} from './type';

export type { ObservabilityPluginOptions } from './type';

export function ChromeObservabilityPlugin(
  options: ObservabilityPluginOptions = {},
): ObservabilityRuntimePlugin {
  return createObservability(options, {
    pluginName: 'observability-plugin:chrome-extension',
    fixedBrowserScope: 'chrome_extension',
    attachInstanceApi: false,
    guardSharedHooksByRuntimeVersion: true,
    guardRuntimeHooksByRuntimeVersion: true,
    disablePreloadHooks: true,
    returnHookArgs: true,
    forceDevelopmentChannels: true,
  }).plugin;
}

export default ChromeObservabilityPlugin;
