/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
import makeSerializable = require('webpack/lib/util/makeSerializable');

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
