/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import makeSerializable from '../makeSerializable';
import { getWebpack, getWebpackApi } from '../webpack';

const ModuleDependency: typeof import('webpack/lib/dependencies/core/ModuleDependency') =
  getWebpackApi(
    getWebpack(),
    (w) => w.dependencies?.ModuleDependency,
    'webpack/lib/dependencies/ModuleDependency',
  );

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
