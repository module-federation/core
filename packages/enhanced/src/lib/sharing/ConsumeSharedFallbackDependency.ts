/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');
const { dependencies } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class ConsumeSharedFallbackDependency extends dependencies.ModuleDependency {
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
