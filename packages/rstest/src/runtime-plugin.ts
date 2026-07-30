import { createRequire } from 'node:module';

import type { RuntimePlugin } from './types';

const require = createRequire(import.meta.url);

const NODE_RUNTIME_PLUGIN_REQUEST = '@module-federation/node/runtimePlugin';
export const NODE_RUNTIME_PLUGIN = require.resolve(NODE_RUNTIME_PLUGIN_REQUEST);

const getRuntimePluginName = (runtimePlugin: RuntimePlugin): string => {
  return typeof runtimePlugin === 'string' ? runtimePlugin : runtimePlugin[0];
};

const isNodeRuntimePluginName = (name: string): boolean => {
  return name === NODE_RUNTIME_PLUGIN_REQUEST || name === NODE_RUNTIME_PLUGIN;
};

const normalizeRuntimePlugin = (
  runtimePlugin: RuntimePlugin,
): RuntimePlugin => {
  if (!isNodeRuntimePluginName(getRuntimePluginName(runtimePlugin))) {
    return runtimePlugin;
  }

  if (typeof runtimePlugin === 'string') {
    return NODE_RUNTIME_PLUGIN;
  }

  return [NODE_RUNTIME_PLUGIN, runtimePlugin[1]];
};

export const normalizeRuntimePlugins = (
  runtimePlugins: RuntimePlugin[] | undefined,
): {
  runtimePlugins: RuntimePlugin[];
  hasConfiguredNodeRuntimePlugin: boolean;
} => {
  const normalized: RuntimePlugin[] = [];
  let hasConfiguredNodeRuntimePlugin = false;

  for (const runtimePlugin of runtimePlugins ?? []) {
    const normalizedPlugin = normalizeRuntimePlugin(runtimePlugin);
    const isNodeRuntimePlugin =
      getRuntimePluginName(normalizedPlugin) === NODE_RUNTIME_PLUGIN;

    if (isNodeRuntimePlugin && hasConfiguredNodeRuntimePlugin) {
      continue;
    }

    normalized.push(normalizedPlugin);
    hasConfiguredNodeRuntimePlugin ||= isNodeRuntimePlugin;
  }

  return {
    runtimePlugins: hasConfiguredNodeRuntimePlugin
      ? normalized
      : [NODE_RUNTIME_PLUGIN, ...normalized],
    hasConfiguredNodeRuntimePlugin,
  };
};
