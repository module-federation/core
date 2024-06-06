/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import ProvideSharedModule from './ProvideSharedModule';
import type {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/ModuleFactory';
import ProvideSharedDependency from './ProvideSharedDependency';

const ModuleFactory = require(
  normalizeWebpackPath('webpack/lib/ModuleFactory'),
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
    // @ts-ignore
    const dep: ProvideSharedDependency = data
      .dependencies[0] as ProvideSharedDependency;
    callback(null, {
      // @ts-ignore
      module: new ProvideSharedModule(
        dep.shareScope,
        dep.name,
        dep.version,
        dep.request,
        dep.eager,
        dep.requiredVersion,
        dep.strictVersion,
        dep.singleton,
      ),
    });
  }
}

export default ProvideSharedModuleFactory;
