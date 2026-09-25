/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import makeSerializable from '../makeSerializable';
const { dependencies } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class RemoteToExternalDependency extends dependencies.ModuleDependency {
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
