import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');

class FederationRuntimeDependency extends ModuleDependency {
  constructor(request: string) {
    super(request);
  }

  override get type() {
    return 'federation runtime dependency';
  }
}

export default FederationRuntimeDependency;
