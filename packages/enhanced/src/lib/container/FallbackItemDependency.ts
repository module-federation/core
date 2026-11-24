/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { getWebpack, getWebpackApi } from '../webpack';

import makeSerializable from '../makeSerializable';
const ModuleDependency: typeof import('webpack/lib/dependencies/core/ModuleDependency') =
  getWebpackApi(
    getWebpack(),
    (w) => w.dependencies?.ModuleDependency,
    'webpack/lib/dependencies/ModuleDependency',
  );

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
