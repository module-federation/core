import { moduleFederationPlugin } from '@module-federation/sdk';
import type { ModuleFederationPlugin as WebpackModuleFederationPlugin } from '@module-federation/enhanced';
import type { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export type BundlerPluginImplementation =
  | typeof WebpackModuleFederationPlugin
  | typeof RspackModuleFederationPlugin;
export type BundlerPlugin =
  | WebpackModuleFederationPlugin
  | RspackModuleFederationPlugin;

export interface PluginOptions {
  config?: moduleFederationPlugin.ModuleFederationPluginOptions;
  configPath?: string;
  bundlerPluginImplementation?: BundlerPluginImplementation;
}
