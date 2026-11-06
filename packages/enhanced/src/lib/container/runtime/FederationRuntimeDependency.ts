import { getWebpack, getWebpackModule } from '../../webpack';

const ModuleDependency = getWebpackModule(
  getWebpack().dependencies?.ModuleDependency,
  'webpack/lib/dependencies/ModuleDependency',
  'webpack/lib/dependencies/core/ModuleDependency',
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
