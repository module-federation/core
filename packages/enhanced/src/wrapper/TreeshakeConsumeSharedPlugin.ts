import type { ConsumeSharedPluginOptions } from '../declarations/plugins/sharing/ConsumeSharedPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'TreeshakeConsumeSharedPlugin';

export default class TreeshakeConsumeSharedPlugin extends BaseWrapperPlugin {
  constructor(options: ConsumeSharedPluginOptions) {
    super(
      options,
      PLUGIN_NAME,
      '../lib/sharing/treeshake/TreeshakeConsumeSharedPlugin',
    );
  }
}
