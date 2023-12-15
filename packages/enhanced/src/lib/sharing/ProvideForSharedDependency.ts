/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');
const { dependencies } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class ProvideForSharedDependency extends dependencies.ModuleDependency {
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
