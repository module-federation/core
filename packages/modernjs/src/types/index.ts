import { moduleFederationPlugin } from '@module-federation/sdk';
import type { ModuleFederationPlugin as WebpackModuleFederationPlugin } from '@module-federation/enhanced';
import type { ModuleFederationPlugin as RspackModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export interface PluginOptions {
  config?: moduleFederationPlugin.ModuleFederationPluginOptions;
  configPath?: string;
  remoteIpStrategy?: 'ipv4' | 'inherit';
  dataLoader?:
    | false
    | Pick<DataLoaderOptions, 'baseName' | 'partialSSRRemotes'>;
}

export interface InternalModernPluginOptions {
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

export type DataLoaderOptions = {
  baseName: string;
  partialSSRRemotes?: string[];
  fetchSSRByRouteIds?: (
    partialSSRRemotes: string[],
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  ) => Promise<string[] | undefined>;
  patchMFConfig?: (
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
    baseName: string,
  ) => void;
};
