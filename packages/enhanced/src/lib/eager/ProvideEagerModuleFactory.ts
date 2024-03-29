/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import ProvideEagerModule from './ProvideEagerModule';
import type {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/ModuleFactory';
import ProvideEagerDependency from './ProvideEagerDependency';

const ModuleFactory = require(
  normalizeWebpackPath('webpack/lib/ModuleFactory'),
) as typeof import('webpack/lib/ModuleFactory');

class ProvideEagerModuleFactory extends ModuleFactory {
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
    const dep: ProvideEagerDependency = data
      .dependencies[0] as ProvideEagerDependency;
    callback(null, {
      // @ts-ignore
      module: new ProvideEagerModule(
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

export default ProvideEagerModuleFactory;
