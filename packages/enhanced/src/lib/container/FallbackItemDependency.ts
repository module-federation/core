/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import makeSerializable from '../makeSerializable';
const { dependencies } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class FallbackItemDependency extends dependencies.ModuleDependency {
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
