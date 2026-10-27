/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/
import { getWebpack, getWebpackModule } from '../webpack';

import ProvideSharedModule from './ProvideSharedModule';
import type {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/ModuleFactory';
import ProvideSharedDependency from './ProvideSharedDependency';

const ModuleFactory = getWebpackModule(
  getWebpack().ModuleFactory,
  'webpack/lib/ModuleFactory',
  'webpack/lib/module/ModuleFactory',
) as typeof import('webpack/lib/ModuleFactory');

class ProvideSharedModuleFactory extends ModuleFactory {
  /**
   * @param {ModuleFactoryCreateData} data data object
   * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  override create(
    data: ModuleFactoryCreateData,
    callback: (error: Error | null, result?: ModuleFactoryResult) => void,
  ): void {
    const dep: ProvideSharedDependency = data
      .dependencies[0] as ProvideSharedDependency;
    callback(null, {
      module: new ProvideSharedModule(
        dep.shareScope,
        dep.name,
        dep.version,
        dep.request,
        dep.eager,
        dep.requiredVersion,
        dep.strictVersion,
        dep.singleton,
        dep.layer,
        dep.treeShakingMode,
      ),
    });
  }
}

export default ProvideSharedModuleFactory;
