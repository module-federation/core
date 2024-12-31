import { moduleFederationPlugin } from '@module-federation/sdk';
import type { ModuleFederationPlugin as WebpackModuleFederationPlugin } from '@module-federation/enhanced';
import type { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export interface PluginOptions {
  config?: moduleFederationPlugin.ModuleFederationPluginOptions;
  configPath?: string;
  ssr?: false;
  remoteIpStrategy?: 'ipv4' | 'inherit';
}

export interface InternalModernPluginOptions {
  csrConfig?: moduleFederationPlugin.ModuleFederationPluginOptions;
  ssrConfig?: moduleFederationPlugin.ModuleFederationPluginOptions;
  distOutputDir: string;
  originPluginOptions: PluginOptions;
  browserPlugin?: BundlerPlugin;
  nodePlugin?: BundlerPlugin;
  remoteIpStrategy?: 'ipv4' | 'inherit';
  userConfig?: PluginOptions;
}

export type BundlerPlugin =
  | WebpackModuleFederationPlugin
  | RspackModuleFederationPlugin;
