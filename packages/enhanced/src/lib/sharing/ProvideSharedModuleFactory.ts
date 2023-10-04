/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/
//@ts-ignore
import ModuleFactory from 'webpack/lib/ModuleFactory';
import ProvideSharedModule from './ProvideSharedModule';
import type {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/ModuleFactory';
import ProvideSharedDependency from './ProvideSharedDependency';

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
      ),
    });
  }
}

export default ProvideSharedModuleFactory;
