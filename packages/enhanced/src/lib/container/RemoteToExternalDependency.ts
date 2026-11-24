/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import { getWebpack, getWebpackApi } from '../webpack';

import makeSerializable from '../makeSerializable';
const ModuleDependency: typeof import('webpack/lib/dependencies/core/ModuleDependency') =
  getWebpackApi(
    getWebpack(),
    (w) => w.dependencies?.ModuleDependency,
    'webpack/lib/dependencies/ModuleDependency',
  );

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
