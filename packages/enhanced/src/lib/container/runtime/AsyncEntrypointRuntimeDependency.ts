import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');
const NullDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/NullDependency'),
) as typeof import('webpack/lib/dependencies/NullDependency');
const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');

class AsyncEntrypointRuntimeDependency extends ModuleDependency {
  static override Template = NullDependency.Template;

  override get type() {
    return 'federation runtime async entrypoint dependency';
  }
}

makeSerializable(
  AsyncEntrypointRuntimeDependency,
  'enhanced/lib/container/runtime/AsyncEntrypointRuntimeDependency',
);

export default AsyncEntrypointRuntimeDependency;
