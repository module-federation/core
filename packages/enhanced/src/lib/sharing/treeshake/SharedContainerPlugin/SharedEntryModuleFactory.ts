import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type SharedEntryDependency from './SharedEntryDependency';
import SharedEntryModule from './SharedEntryModule';

const ModuleFactory = require(
  normalizeWebpackPath('webpack/lib/ModuleFactory'),
) as typeof import('webpack/lib/ModuleFactory');
import type {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/ModuleFactory';

export default class SharedEntryModuleFactory extends ModuleFactory {
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
      dependencies as unknown as SharedEntryDependency[];
    const dep = containerDependencies[0];

    callback(null, {
      // @ts-ignore
      module: new SharedEntryModule(dep.name, dep.request),
    });
  }
}
