/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

'use strict';
import ModuleDependency from 'webpack/lib/dependencies/ModuleDependency';
import makeSerializable from 'webpack/lib/util/makeSerializable';

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
  'webpack/lib/container/RemoteToExternalDependency',
);

export default RemoteToExternalDependency;
