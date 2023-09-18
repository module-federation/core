/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

import ModuleDependency from 'webpack/lib/dependencies/ModuleDependency';
import makeSerializable from 'webpack/lib/util/makeSerializable';

class FallbackItemDependency extends ModuleDependency {
  /**
   * @param {string} request request
   */
  constructor(request: string) {
    super(request);
  }

  override get type(): string {
    return 'fallback item';
  }

  override get category(): string {
    return 'esm';
  }
}

makeSerializable(
  FallbackItemDependency,
  'webpack/lib/container/FallbackItemDependency',
);

export default FallbackItemDependency;
