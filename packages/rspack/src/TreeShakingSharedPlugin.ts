import type { Compiler, RspackPluginInstance } from '@rspack/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

export const PLUGIN_NAME = 'RspackTreeShakingSharedPlugin';

export interface TreeShakingSharedPluginOptions {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  secondary?: boolean;
}

export class TreeShakingSharedPlugin implements RspackPluginInstance {
  readonly name = PLUGIN_NAME;
  private _options: moduleFederationPlugin.ModuleFederationPluginOptions;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this._options = options;
  }

  apply(compiler: Compiler) {
    // @ts-expect-error wait rspack release
    new compiler.rspack.sharing.TreeShakingSharedPlugin(this._options).apply(
      compiler,
    );
  }
}
