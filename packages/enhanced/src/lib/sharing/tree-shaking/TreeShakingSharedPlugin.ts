import type { Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

import SharedUsedExportsOptimizerPlugin from './SharedUsedExportsOptimizerPlugin';
import IndependentSharedPlugin from './IndependentSharedPlugin';
import { normalizeSharedOptions } from '../SharePlugin';
export interface TreeShakingSharePluginOptions {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  reShake?: boolean;
}

export default class TreeShakingSharedPlugin {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  outputDir: string;
  reShake?: boolean;
  private _independentSharePlugin?: IndependentSharedPlugin;

  name = 'TreeShakingSharedPlugin';
  constructor(options: TreeShakingSharePluginOptions) {
    const { mfConfig, reShake } = options;
    this.mfConfig = mfConfig;
    this.outputDir = mfConfig.treeShakingDir || 'independent-packages';
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
        ([_, config]) => config.treeShaking && config.import !== false,
      )
    ) {
      if (!reShake) {
        new SharedUsedExportsOptimizerPlugin(
          sharedOptions,
          mfConfig.injectTreeShakingUsedExports,
          undefined,
          mfConfig.manifest,
        ).apply(compiler);
      }

      this._independentSharePlugin = new IndependentSharedPlugin({
        name: name,
        shared: shared,
        outputDir,
        plugins:
          mfConfig.treeShakingSharedPlugins?.map((p) => {
            const _constructor = require(p);
            return new _constructor();
          }) || [],
        treeShakingSharedExcludePlugins:
          mfConfig.treeShakingSharedExcludePlugins,
        treeShaking: reShake,
        library,
        manifest: mfConfig.manifest,
      });
      this._independentSharePlugin.apply(compiler);
    }
  }
}
