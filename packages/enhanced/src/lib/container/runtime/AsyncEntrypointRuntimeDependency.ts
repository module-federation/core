import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');
const NullDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/NullDependency'),
) as typeof import('webpack/lib/dependencies/NullDependency');

class AsyncEntrypointRuntimeDependency extends ModuleDependency {
  static override Template = NullDependency.Template;

  override get type() {
    return 'federation runtime async entrypoint dependency';
  }
}

export default AsyncEntrypointRuntimeDependency;
