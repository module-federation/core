import type { TreeshakeSharePluginOptions } from '../lib/sharing/treeshake/TreeshakeSharedPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'TreeshakeSharedPlugin';

export default class TreeshakeSharedPlugin extends BaseWrapperPlugin {
  constructor(options: TreeshakeSharePluginOptions) {
    super(
      options,
      PLUGIN_NAME,
      '../lib/sharing/treeshake/TreeshakeSharedPlugin',
    );
  }
}
