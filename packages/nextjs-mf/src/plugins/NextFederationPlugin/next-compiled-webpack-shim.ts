import path from 'path';

const localWebpackPathEnvKey = 'NEXT_MF_LOCAL_WEBPACK_PATH';
const resolveLocalWebpackPath = (): string | undefined =>
  process.env[localWebpackPathEnvKey];

const resolveWebpackLibPath = (requestPath: string): string => {
  const localWebpackPath = resolveLocalWebpackPath();

  if (localWebpackPath) {
    const webpackLibDir = path.dirname(localWebpackPath);
    return path.join(webpackLibDir, requestPath);
  }

  return `webpack/lib/${requestPath}`;
};

const requireLocalWebpack = () => {
  const localWebpackPath = resolveLocalWebpackPath();

  if (localWebpackPath) {
    return require(localWebpackPath) as typeof import('webpack');
  }

  return require('webpack') as typeof import('webpack');
};

const requireWebpackInternal = <T>(
  requestPath: string,
  fallback: string,
): T => {
  try {
    return require(resolveWebpackLibPath(requestPath)) as T;
  } catch {
    return require(fallback) as T;
  }
};

const webpackModule = requireLocalWebpack();

const webpackShim = {
  __esModule: true,
  default: undefined as undefined,
  BasicEvaluatedExpression: requireWebpackInternal(
    'javascript/BasicEvaluatedExpression',
    'webpack/lib/javascript/BasicEvaluatedExpression',
  ),
  ConcatenatedModule: requireWebpackInternal(
    'optimize/ConcatenatedModule',
    'webpack/lib/optimize/ConcatenatedModule',
  ),
  makePathsAbsolute: requireWebpackInternal<{
    makePathsAbsolute: (...args: unknown[]) => unknown;
  }>('util/identifier', 'webpack/lib/util/identifier').makePathsAbsolute,
  ModuleFilenameHelpers: requireWebpackInternal(
    'ModuleFilenameHelpers',
    'webpack/lib/ModuleFilenameHelpers',
  ),
  NodeTargetPlugin: requireWebpackInternal(
    'node/NodeTargetPlugin',
    'webpack/lib/node/NodeTargetPlugin',
  ),
  RuntimeGlobals: requireWebpackInternal(
    'RuntimeGlobals',
    'webpack/lib/RuntimeGlobals',
  ),
  SourceMapDevToolModuleOptionsPlugin: requireWebpackInternal(
    'SourceMapDevToolModuleOptionsPlugin',
    'webpack/lib/SourceMapDevToolModuleOptionsPlugin',
  ),
  StringXor: requireWebpackInternal(
    'util/StringXor',
    'webpack/lib/util/StringXor',
  ),
  NormalModule: requireWebpackInternal(
    'NormalModule',
    'webpack/lib/NormalModule',
  ),
  sources: webpackModule.sources,
  webpack: webpackModule,
};

export default webpackShim;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = webpackShim;
}
