import type { Compiler, WebpackPluginInstance } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

import SharedUsedExportsOptimizerPlugin from './SharedUsedExportsOptimizerPlugin';
import IndependentSharedPlugin from './IndependentSharedPlugin';
import { normalizeSharedOptions } from '../SharePlugin';

export interface TreeshakeSharePluginOptions {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  plugins?: WebpackPluginInstance[];
  reshake?: boolean;
}

export default class TreeshakeSharePlugin {
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  outputDir: string;
  plugins?: WebpackPluginInstance[];
  reshake?: boolean;
  private _independentSharePlugin?: IndependentSharedPlugin;

  name = 'TreeshakeSharePlugin';
  constructor(options: TreeshakeSharePluginOptions) {
    const { mfConfig, plugins, reshake } = options;
    this.mfConfig = mfConfig;
    this.outputDir = mfConfig.independentShareDir || 'independent-packages';
    this.plugins = plugins;
    this.reshake = Boolean(reshake);
  }

  apply(compiler: Compiler) {
    const { mfConfig, outputDir, plugins, reshake } = this;
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
      if (!reshake) {
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
        plugins,
        treeshake: reshake,
        library,
        manifest: mfConfig.manifest,
      });
      this._independentSharePlugin.apply(compiler);
    }
  }
}
