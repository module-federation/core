import type { TreeShakingSharePluginOptions } from '../lib/sharing/tree-shaking/TreeShakingSharedPlugin';
import CoreTreeShakingSharedPlugin from '../lib/sharing/tree-shaking/TreeShakingSharedPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'TreeShakingSharedPlugin';

export default class TreeShakingSharedPlugin extends BaseWrapperPlugin {
  constructor(options: TreeShakingSharePluginOptions) {
    super(options, PLUGIN_NAME, CoreTreeShakingSharedPlugin);
  }
}
