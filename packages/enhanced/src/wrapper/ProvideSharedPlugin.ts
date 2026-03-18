import type { provideSharedPlugin } from '@module-federation/sdk';
type ProvideSharedPluginOptions =
  provideSharedPlugin.ProvideSharedPluginOptions;
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'ProvideSharedPlugin';

export default class ProvideSharedPlugin extends BaseWrapperPlugin {
  constructor(options: ProvideSharedPluginOptions) {
    super(options, PLUGIN_NAME, '../lib/sharing/ProvideSharedPlugin');
  }
}
