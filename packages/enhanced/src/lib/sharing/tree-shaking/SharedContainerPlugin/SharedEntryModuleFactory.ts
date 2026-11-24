import type SharedEntryDependency from './SharedEntryDependency';
import SharedEntryModule from './SharedEntryModule';
import { getWebpack, getWebpackApi } from '../../../webpack';

const ModuleFactory = getWebpackApi(
  getWebpack(),
  (w) => w.ModuleFactory,
  'webpack/lib/ModuleFactory',
);
import type {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/module/ModuleFactory';

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
