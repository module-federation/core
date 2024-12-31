import { PluginOptions, InternalModernPluginOptions } from './index';
import type { init } from '@module-federation/enhanced/runtime';
import { moduleFederationPlugin } from '@module-federation/sdk';

type TransformRuntimeOptions = (
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
) => Parameters<typeof init>[0];

export type RoutesPluginOptions = {
  userConfig: PluginOptions;
  internalOptions: InternalModernPluginOptions;
  serverPlugin?: string;
  transformRuntimeOptions?: TransformRuntimeOptions;
};

export type InternalRoutesPluginOptions = {
  entries: Set<string>;
  remotePathMap: Record<string, { name: string; path: string }>;
  ssrByRouteIdsMap: Record<string, string>;
} & RoutesPluginOptions;
