import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { ResolvedProvideMap } from '../lib/sharing/treeshake/CollectSharedEntryPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'ShareContainerPlugin';

export default class ShareContainerPlugin extends BaseWrapperPlugin {
  constructor(options: {
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
    currentShared: string;
    resolvedProvideMap: ResolvedProvideMap;
    outputDirName: string;
  }) {
    super(
      options,
      PLUGIN_NAME,
      '../lib/sharing/treeshake/ShareContainerPlugin/ShareContainerPlugin',
    );
  }

  protected override createCorePluginInstance(
    CorePlugin: any,
    compiler: any,
  ): void {
    const { mfConfig, currentShared, resolvedProvideMap, outputDirName } =
      this._options;
    new CorePlugin(
      mfConfig,
      currentShared,
      resolvedProvideMap,
      outputDirName,
    ).apply(compiler);
  }
}
