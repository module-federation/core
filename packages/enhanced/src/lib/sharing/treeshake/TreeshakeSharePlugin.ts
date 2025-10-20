import type { Compiler } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

import OptimizeDependencyReferencedExportsPlugin, {
  CustomReferencedExports,
} from './OptimizeDependencyReferencedExportsPlugin';
import type { SharedConfig } from '../../../declarations/plugins/sharing/SharePlugin';
import { parseOptions } from '../../container/options';
import { isRequiredVersion } from '@module-federation/sdk';
import IndependentSharePlugin, { MakeRequired } from './IndependentSharePlugin';

export interface TreeshakeSharePluginOptions {
  mfConfig: MakeRequired<
    moduleFederationPlugin.ModuleFederationPluginOptions,
    'shared' | 'name'
  >;
  outputDir?: string;
}

export default class TreeshakeSharePlugin {
  mfConfig: MakeRequired<
    moduleFederationPlugin.ModuleFederationPluginOptions,
    'shared' | 'name'
  >;
  compilers: Map<string, Compiler> = new Map();
  sharedOptions: [string, SharedConfig][];
  sharedPathSet: Set<string> = new Set();
  outputDir: string;
  customReferencedExports: CustomReferencedExports = {};
  buildIndependentShared = false;

  name = 'TreeshakeSharePlugin';
  constructor(options: TreeshakeSharePluginOptions) {
    const { mfConfig, outputDir } = options;
    this.mfConfig = mfConfig;
    this.outputDir = outputDir || 'independent-packages';
    const handleShareConfig = (shareConfig: SharedConfig) => {
      if (shareConfig.usedExports && shareConfig.import) {
        this.customReferencedExports[shareConfig.import] =
          shareConfig.usedExports;
      }
      if (shareConfig.treeshake) {
        this.buildIndependentShared = true;
      }
    };
    this.sharedOptions = parseOptions(
      mfConfig.shared,
      (item, key) => {
        if (typeof item !== 'string')
          throw new Error(
            `Unexpected array in shared configuration for key "${key}"`,
          );
        const config: SharedConfig =
          item === key || !isRequiredVersion(item)
            ? {
                import: item,
              }
            : {
                import: key,
                requiredVersion: item,
              };

        handleShareConfig(config);
        return config;
      },
      (item) => {
        handleShareConfig(item);
        return item;
      },
    );
  }

  apply(compiler: Compiler) {
    const { mfConfig, outputDir, sharedOptions, buildIndependentShared } = this;
    if (!sharedOptions.length) {
      return;
    }
    new OptimizeDependencyReferencedExportsPlugin(
      sharedOptions,
      undefined,
    ).apply(compiler);
    if (buildIndependentShared) {
      new IndependentSharePlugin({ mfConfig, outputDir }).apply(compiler);
    }
  }
}
