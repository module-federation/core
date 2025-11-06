import type { containerReferencePlugin } from '@module-federation/sdk';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'ContainerReferencePlugin';

export default class ContainerReferencePlugin extends BaseWrapperPlugin {
  constructor(
    options: containerReferencePlugin.ContainerReferencePluginOptions,
  ) {
    super(options, PLUGIN_NAME, '../lib/container/ContainerReferencePlugin');
  }
}
