import type { TreeshakeSharePluginOptions } from '../lib/sharing/treeshake/TreeshakeSharePlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'TreeshakeSharePlugin';

export default class TreeshakeSharePlugin extends BaseWrapperPlugin {
  constructor(options: TreeshakeSharePluginOptions) {
    super(
      options,
      PLUGIN_NAME,
      '../lib/sharing/treeshake/TreeshakeSharePlugin',
    );
  }
}
