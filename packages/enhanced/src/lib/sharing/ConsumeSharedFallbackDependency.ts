/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

import ModuleDependency from 'webpack/lib/dependencies/ModuleDependency';
import makeSerializable from 'webpack/lib/util/makeSerializable';

class ConsumeSharedFallbackDependency extends ModuleDependency {
  /**
   * @param {string} request the request
   */
  constructor(request: string) {
    super(request);
    this.request = request;
  }

  override get type(): string {
    return 'consume shared fallback';
  }

  override get category(): string {
    return 'esm';
  }
}

makeSerializable(
  ConsumeSharedFallbackDependency,
  'webpack/lib/sharing/ConsumeSharedFallbackDependency',
);

export default ConsumeSharedFallbackDependency;
