import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

import SharedUsedExportsOptimizerPlugin from './SharedUsedExportsOptimizerPlugin';
import IndependentSharedPlugin from './IndependentSharedPlugin';
import { normalizeSharedOptions } from '../SharePlugin';

export interface TreeshakeSharePluginOptions {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  reShake?: boolean;
}

export default class TreeshakeSharedPlugin {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  outputDir: string;
  reShake?: boolean;
  private _independentSharePlugin?: IndependentSharedPlugin;

  name = 'TreeshakeSharedPlugin';
  constructor(options: TreeshakeSharePluginOptions) {
    const { mfConfig, reShake } = options;
    this.mfConfig = mfConfig;
    this.outputDir = mfConfig.independentShareDir || 'independent-packages';
    this.reShake = Boolean(reShake);
  }

  apply(compiler: Compiler) {
    const { mfConfig, outputDir, reShake } = this;
    const { name, shared, library } = mfConfig;
    if (!name) {
      throw new Error('name is required');
    }
    if (!shared) {
      return;
    }
    const sharedOptions = normalizeSharedOptions(shared);
    if (!sharedOptions.length) {
      return;
    }

    if (
      sharedOptions.some(
        ([_, config]) => config.treeshake && config.import !== false,
      )
    ) {
      if (!reShake) {
        new SharedUsedExportsOptimizerPlugin(
          sharedOptions,
          mfConfig.injectUsedExports,
          undefined,
          mfConfig.manifest,
        ).apply(compiler);
      }
      this._independentSharePlugin = new IndependentSharedPlugin({
        name: name,
        shared: shared,
        outputDir,
        plugins: mfConfig.treeshakeSharedPlugins?.map((p) => require(p)) || [],
        treeshakeSharedExcludePlugins: mfConfig.treeshakeSharedExcludePlugins,
        treeshake: reShake,
        library,
        manifest: mfConfig.manifest,
      });
      this._independentSharePlugin.apply(compiler);
    }
  }
}
