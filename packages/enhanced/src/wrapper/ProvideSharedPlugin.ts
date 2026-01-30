import type { ProvideSharedPluginOptions } from '../declarations/plugins/sharing/ProvideSharedPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'ProvideSharedPlugin';

export default class ProvideSharedPlugin extends BaseWrapperPlugin {
  constructor(options: ProvideSharedPluginOptions) {
    super(options, PLUGIN_NAME, '../lib/sharing/ProvideSharedPlugin');
  }
}
