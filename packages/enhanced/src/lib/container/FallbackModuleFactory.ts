/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

'use strict';
import {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/ModuleFactory';
import ModuleFactory from 'webpack/lib/ModuleFactory';
import FallbackModule from './FallbackModule';
import FallbackDependency from './FallbackDependency';

export default class FallbackModuleFactory extends ModuleFactory {
  /**
   * @param {ModuleFactoryCreateData} data data object
   * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  override create(
    data: ModuleFactoryCreateData,
    callback: (error: Error | null, result?: ModuleFactoryResult) => void,
  ): void {
    const dependency = data.dependencies[0] as FallbackDependency;
    callback(null, {
      module: new FallbackModule(dependency.requests),
    });
  }
}
