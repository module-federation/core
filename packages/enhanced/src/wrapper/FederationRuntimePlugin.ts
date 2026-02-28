import type { moduleFederationPlugin } from '@module-federation/sdk';
import CoreFederationRuntimePlugin from '../lib/container/runtime/FederationRuntimePlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'FederationRuntimePlugin';

export default class FederationRuntimePlugin extends BaseWrapperPlugin {
  entryFilePath: string;

  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions) {
    super(options, PLUGIN_NAME, CoreFederationRuntimePlugin);
    this.entryFilePath = '';
  }

  protected override createCorePluginInstance(
    CorePlugin: any,
    compiler: any,
  ): void {
    const pluginInstance = new CorePlugin(this._options);
    pluginInstance.apply(compiler);
    this.entryFilePath = pluginInstance.entryFilePath;
  }
}
