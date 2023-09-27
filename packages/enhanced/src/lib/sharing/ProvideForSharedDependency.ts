/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
//@ts-ignore
import ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
//@ts-ignore
import makeSerializable = require('webpack/lib/util/makeSerializable');

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
  'enhanced/lib/sharing/ProvideForSharedDependency',
);

export default ProvideForSharedDependency;
