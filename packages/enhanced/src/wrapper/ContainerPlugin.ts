import type { containerPlugin } from '@module-federation/sdk';
import CoreContainerPlugin from '../lib/container/ContainerPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'ContainerPlugin';

export default class ContainerPlugin extends BaseWrapperPlugin {
  constructor(options: containerPlugin.ContainerPluginOptions) {
    super(options, PLUGIN_NAME, CoreContainerPlugin);
  }
}
