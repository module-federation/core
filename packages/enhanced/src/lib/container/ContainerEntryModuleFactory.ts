/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

'use strict';

import ContainerEntryModule from './ContainerEntryModule';
import ContainerEntryDependency from './ContainerEntryDependency';
import ModuleFactory = require('webpack/lib/ModuleFactory');
import type { ModuleFactoryCreateData, ModuleFactoryResult } from 'webpack/lib/ModuleFactory';

export default class ContainerEntryModuleFactory extends ModuleFactory {
  /**
   * @param {ModuleFactoryCreateData} data data object
   * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  override create(
    data: ModuleFactoryCreateData,
    callback: (error: Error | null, result: ModuleFactoryResult) => void,
  ): void {
    const { dependencies } = data;
    const containerDependencies =
      dependencies as unknown as ContainerEntryDependency[];
    const dep = containerDependencies[0];

    callback(null, {
      module: new ContainerEntryModule(dep.name, dep.exposes, dep.shareScope),
    });
  }
}

