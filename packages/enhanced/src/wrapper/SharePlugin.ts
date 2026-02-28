import type { SharePluginOptions } from '../declarations/plugins/sharing/SharePlugin';
import CoreSharePlugin from '../lib/sharing/SharePlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'SharePlugin';

export default class SharePlugin extends BaseWrapperPlugin {
  constructor(options: SharePluginOptions) {
    super(options, PLUGIN_NAME, CoreSharePlugin);
  }
}
