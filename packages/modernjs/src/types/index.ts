import { moduleFederationPlugin } from '@module-federation/sdk';
import type { ModuleFederationPlugin as WebpackModuleFederationPlugin } from '@module-federation/enhanced';
import type { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export interface PluginOptions {
  config?: moduleFederationPlugin.ModuleFederationPluginOptions;
  configPath?: string;
  exportRoutes?: boolean;
  importRoutes?: boolean;
}

export interface InternalModernPluginOptions {
  metaName?: string;
  csrConfig?: moduleFederationPlugin.ModuleFederationPluginOptions;
  ssrConfig?: moduleFederationPlugin.ModuleFederationPluginOptions;
  distOutputDir: string;
  originPluginOptions: PluginOptions;
  browserPlugin?: BundlerPlugin;
  nodePlugin?: BundlerPlugin;
  remoteIpStrategy?: 'ipv4' | 'inherit';
}
export type BundlerPlugin =
  | WebpackModuleFederationPlugin
  | RspackModuleFederationPlugin;
