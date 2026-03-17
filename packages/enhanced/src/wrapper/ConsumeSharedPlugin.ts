import type { consumeSharedPlugin } from '@module-federation/sdk';
type ConsumeSharedPluginOptions =
  consumeSharedPlugin.ConsumeSharedPluginOptions;
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'ConsumeSharedPlugin';

export default class ConsumeSharedPlugin extends BaseWrapperPlugin {
  constructor(options: ConsumeSharedPluginOptions) {
    super(options, PLUGIN_NAME, '../lib/sharing/ConsumeSharedPlugin');
  }
}
