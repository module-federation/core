/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import { getWebpack, getWebpackModule } from '../webpack';

import makeSerializable from '../makeSerializable';
const ModuleDependency = getWebpackModule(
  getWebpack().dependencies?.ModuleDependency,
  'webpack/lib/dependencies/ModuleDependency',
  'webpack/lib/dependencies/core/ModuleDependency',
) as typeof import('webpack/lib/dependencies/ModuleDependency');

class RemoteToExternalDependency extends ModuleDependency {
  /**
   * @param {string} request request
   */
  constructor(request: string) {
    super(request);
  }
  override get type() {
    return 'remote to external';
  }

  override get category() {
    return 'esm';
  }
}

makeSerializable(
  RemoteToExternalDependency,
  'enhanced/lib/container/RemoteToExternalDependency',
);

export default RemoteToExternalDependency;
