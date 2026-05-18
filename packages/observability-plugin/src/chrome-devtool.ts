import type { ObservabilityRuntimePlugin } from './core';
import { createObservability, type ObservabilityPluginOptions } from './core';

export type { ObservabilityPluginOptions } from './core';

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
  }).plugin;
}

export default ChromeObservabilityPlugin;
