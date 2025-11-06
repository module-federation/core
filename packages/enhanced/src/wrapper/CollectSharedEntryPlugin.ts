import type { moduleFederationPlugin } from '@module-federation/sdk';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'CollectSharedEntryPlugin';

export default class CollectSharedEntryPlugin extends BaseWrapperPlugin {
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    super(
      options,
      PLUGIN_NAME,
      '../lib/sharing/treeshake/CollectSharedEntryPlugin',
    );
  }
}
