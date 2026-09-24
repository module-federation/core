import { moduleFederationPlugin } from '@module-federation/sdk';
import type { StatsAssetResource } from '@module-federation/rsbuild-plugin/utils';

export interface BridgeOptions {
  /** Expose a complete Modern application. true selects the main entry. */
  exposes?: Record<string, string | true>;
  /** Maximum duration of an independent SSR application, in milliseconds. */
  timeoutMs?: number;
}

export interface PluginOptions {
  /** Enable independent-root Bridge streaming SSR and generated application exposes. */
  bridge?: boolean | BridgeOptions;
  config?: moduleFederationPlugin.ModuleFederationPluginOptions;
  configPath?: string;
  /**
   * Automatically set the federation optimization target from the Modern.js
   * SSR and bundler target configuration.
   * @default true
   */
  autoOptimization?: boolean;
  ssr?:
    | {
        distOutputDir?: string;
      }
    | boolean;
  fetchServerQuery?: Record<string, unknown>;
  secondarySharedTreeShaking?: boolean;
}

export type AssetFileNames = {
  statsFileName: string;
  manifestFileName: string;
};
export interface InternalModernPluginOptions {
  csrConfig?: moduleFederationPlugin.ModuleFederationPluginOptions;
  ssrConfig?: moduleFederationPlugin.ModuleFederationPluginOptions;
  distOutputDir: string;
  originPluginOptions: PluginOptions;
  browserPlugin?: BundlerPlugin;
  nodePlugin?: BundlerPlugin;
  assetFileNames: {
    node?: AssetFileNames;
    browser?: AssetFileNames;
  };
  assetResources: {
    browser?: StatsAssetResource;
    node?: StatsAssetResource;
  };
  userConfig?: PluginOptions;
  fetchServerQuery?: Record<string, unknown>;
  secondarySharedTreeShaking?: boolean;
}

export type BundlerPlugin = any;
