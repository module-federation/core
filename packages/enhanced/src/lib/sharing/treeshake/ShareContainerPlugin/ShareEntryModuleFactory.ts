import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type ShareEntryDependency from './ShareEntryDependency';
import ShareEntryModule from './ShareEntryModule';

const ModuleFactory = require(
  normalizeWebpackPath('webpack/lib/ModuleFactory'),
) as typeof import('webpack/lib/ModuleFactory');
import type {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/ModuleFactory';

export default class ShareEntryModuleFactory extends ModuleFactory {
  /**
   * @param {ModuleFactoryCreateData} data data object
   * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  // @ts-ignore
  override create(
    data: ModuleFactoryCreateData,
    callback: (error: Error | null, result: ModuleFactoryResult) => void,
  ): void {
    const { dependencies } = data;
    const containerDependencies =
      dependencies as unknown as ShareEntryDependency[];
    const dep = containerDependencies[0];

    callback(null, {
      // @ts-ignore
      module: new ShareEntryModule(dep.name, dep.request),
    });
  }
}
