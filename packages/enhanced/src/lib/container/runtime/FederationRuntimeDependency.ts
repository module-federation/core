import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');

class FederationRuntimeDependency extends ModuleDependency {
  minimal: boolean;

  constructor(request: string, minimal = false) {
    super(request);
    this.minimal = minimal;
  }

  override get type() {
    if (this.minimal) {
      return 'minimal federation runtime dependency';
    }
    return 'federation runtime dependency';
  }
}

export default FederationRuntimeDependency;
