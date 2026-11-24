import { getWebpack, getWebpackApi } from '../../webpack';

const ModuleDependency: typeof import('webpack/lib/dependencies/core/ModuleDependency') =
  getWebpackApi(
    getWebpack(),
    (w) => w.dependencies?.ModuleDependency,
    'webpack/lib/dependencies/ModuleDependency',
  );

class FederationRuntimeDependency extends ModuleDependency {
  constructor(request: string) {
    super(request);
  }

  override get type() {
    return 'federation runtime dependency';
  }
}

export default FederationRuntimeDependency;
