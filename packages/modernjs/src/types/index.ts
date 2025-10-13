import { moduleFederationPlugin } from '@module-federation/sdk';
import type { ModuleFederationPlugin as WebpackModuleFederationPlugin } from '@module-federation/enhanced';
import type { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import type { StatsAssetResource } from '@module-federation/rsbuild-plugin/utils';

export interface PluginOptions {
  config?: moduleFederationPlugin.ModuleFederationPluginOptions;
  configPath?: string;
  ssr?:
    | {
        distOutputDir?: string;
      }
    | boolean;
  remoteIpStrategy?: 'ipv4' | 'inherit';
  fetchServerQuery?: Record<string, unknown>;
}

export interface InternalModernPluginOptions {
  csrConfig?: moduleFederationPlugin.ModuleFederationPluginOptions;
  ssrConfig?: moduleFederationPlugin.ModuleFederationPluginOptions;
  distOutputDir: string;
  originPluginOptions: PluginOptions;
  browserPlugin?: BundlerPlugin;
  nodePlugin?: BundlerPlugin;
  assetResources: {
    browser?: StatsAssetResource;
    node?: StatsAssetResource;
  };
  remoteIpStrategy?: 'ipv4' | 'inherit';
  userConfig?: PluginOptions;
  fetchServerQuery?: Record<string, unknown>;
}

export type BundlerPlugin = any;
