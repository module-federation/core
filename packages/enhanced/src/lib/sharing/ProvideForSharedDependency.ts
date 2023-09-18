/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

import ModuleDependency from 'webpack/lib/dependencies/ModuleDependency';
import makeSerializable from 'webpack/lib/util/makeSerializable';

class ProvideForSharedDependency extends ModuleDependency {
  /**
   *
   * @param request request string
   */
  constructor(request: string) {
    super(request);
  }

  override get type(): string {
    return 'provide module for shared';
  }

  override get category(): string {
    return 'esm';
  }
}

makeSerializable(
  ProvideForSharedDependency,
  'webpack/lib/sharing/ProvideForSharedDependency',
);

export default ProvideForSharedDependency;
