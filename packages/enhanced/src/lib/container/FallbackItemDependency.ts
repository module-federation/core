/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
//@ts-ignore
import ModuleDependency = require('webpack/lib/dependencies/ModuleDependency');
//@ts-ignore
import makeSerializable = require('webpack/lib/util/makeSerializable');

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
  'enhanced/lib/container/FallbackItemDependency',
);

export default FallbackItemDependency;
