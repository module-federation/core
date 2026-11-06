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

class ConsumeSharedFallbackDependency extends ModuleDependency {
  layer?: string | null;

  /**
   * @param {string} request the request
   * @param {string | null} layer the layer for the fallback module
   */
  constructor(request: string, layer?: string | null) {
    super(request);
    this.layer = layer;
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
  'enhanced/lib/sharing/ConsumeSharedFallbackDependency',
);

export default ConsumeSharedFallbackDependency;
