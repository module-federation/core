import type { containerPlugin } from '@module-federation/sdk';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'ContainerPlugin';

export default class ContainerPlugin extends BaseWrapperPlugin {
  constructor(options: containerPlugin.ContainerPluginOptions) {
    super(options, PLUGIN_NAME, '../lib/container/ContainerPlugin');
  }
}
