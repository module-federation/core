import type { containerReferencePlugin } from '@module-federation/sdk';
import CoreContainerReferencePlugin from '../lib/container/ContainerReferencePlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'ContainerReferencePlugin';

export default class ContainerReferencePlugin extends BaseWrapperPlugin {
  constructor(
    options: containerReferencePlugin.ContainerReferencePluginOptions,
  ) {
    super(options, PLUGIN_NAME, CoreContainerReferencePlugin);
  }
}
