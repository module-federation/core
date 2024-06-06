/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/

'use strict';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type {
  ModuleFactoryCreateData,
  ModuleFactoryResult,
} from 'webpack/lib/ModuleFactory';
import FallbackModule from './FallbackModule';

const ModuleFactory = require(
  normalizeWebpackPath('webpack/lib/ModuleFactory'),
) as typeof import('webpack/lib/ModuleFactory');

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
    const dependency = data.dependencies[0];
    callback(null, {
      // @ts-expect-error Module !== FallbackModule
      module: new FallbackModule(dependency.requests),
    });
  }
}
