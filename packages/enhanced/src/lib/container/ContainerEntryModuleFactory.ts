/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

import ContainerEntryModule from './ContainerEntryModule';
import type ContainerEntryDependency from './ContainerEntryDependency';
import {
  ModuleFactory,
  ModuleFactoryResult,
  ModuleFactoryCreateData,
} from '../../types';

export default class ContainerEntryModuleFactory extends ModuleFactory {
  /**
   * @param {ModuleFactoryCreateData} data data object
   * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  override create(
    data: ModuleFactoryCreateData,
    callback: (
      error: Error | null | undefined,
      result?: ModuleFactoryResult,
    ) => void,
  ): void {
    const dep = dependency as ContainerEntryDependency;
    callback(null, {
      module: new ContainerEntryModule(dep.name, dep.exposes, dep.shareScope),
    });
  }
}
