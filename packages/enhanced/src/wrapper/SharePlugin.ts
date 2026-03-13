import type { sharePlugin } from '@module-federation/sdk';
type SharePluginOptions = sharePlugin.SharePluginOptions;
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'SharePlugin';

export default class SharePlugin extends BaseWrapperPlugin {
  constructor(options: SharePluginOptions) {
    super(options, PLUGIN_NAME, '../lib/sharing/SharePlugin');
  }
}
