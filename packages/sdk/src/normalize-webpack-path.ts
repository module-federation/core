import type webpack from 'webpack';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const webpackRequire = createRequire(import.meta.url);

// webpack 5.112 grouped these internal modules by owner. Keep the legacy
// requests working with both layouts and with the selected compiler's webpack.
const relocatedWebpackPaths: Record<string, string> = {
  'webpack/lib/util/extractUrlAndGlobal':
    'webpack/lib/externals/extractUrlAndGlobal',
  'webpack/lib/util/semver': 'webpack/lib/sharing/semver',
  'webpack/lib/util/fs': 'webpack/lib/fs/fs',
  'webpack/lib/ModuleFactory': 'webpack/lib/module/ModuleFactory',
  'webpack/lib/dependencies/StaticExportsDependency':
    'webpack/lib/dependencies/core/StaticExportsDependency',
  'webpack/lib/dependencies/EntryDependency':
    'webpack/lib/entry/EntryDependency',
  'webpack/lib/dependencies/ModuleDependency':
    'webpack/lib/dependencies/core/ModuleDependency',
  'webpack/lib/HotUpdateChunk': 'webpack/lib/graph/HotUpdateChunk',
};

export function getWebpackPath(
  compiler: webpack.Compiler,
  options: { framework: 'nextjs' | 'other' } = { framework: 'other' },
): string {
  try {
    // @ts-ignore just throw err
    compiler.webpack();
    return '';
  } catch (err) {
    const trace = (err as Error).stack?.split('\n') || [];
    const webpackErrLocation =
      trace.find((item) => item.includes('at webpack')) || '';
    const webpackLocationWithDetail = webpackErrLocation
      .replace(/[^\(\)]+/, '')
      .slice(1, -1);
    const webpackPath = webpackLocationWithDetail
      .split(':')
      .slice(0, -2)
      .join(':');
    if (options?.framework === 'nextjs') {
      if (webpackPath.endsWith('webpack.js')) {
        return webpackPath.replace('webpack.js', 'index.js');
      }
      return '';
    }
    if (!webpackPath) return '';

    // Resolve the compiler's package directory directly: npm aliases need not
    // be installed under a directory named "webpack".
    return webpackRequire.resolve(resolve(webpackPath, '../..'));
  }
}

export const normalizeWebpackPath = (fullPath: string): string => {
  const webpackPath = process.env['FEDERATION_WEBPACK_PATH'];
  if (fullPath === 'webpack') {
    return webpackPath || fullPath;
  }

  const normalize = (request: string): string =>
    webpackPath
      ? resolve(webpackPath, request.replace('webpack', '../../'))
      : request;
  const normalizedPath = normalize(fullPath);
  if (!Object.prototype.hasOwnProperty.call(relocatedWebpackPaths, fullPath)) {
    return normalizedPath;
  }
  const relocatedPath = relocatedWebpackPaths[fullPath];

  try {
    webpackRequire.resolve(normalizedPath);
    return normalizedPath;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND')
      throw error;
  }

  const normalizedRelocatedPath = normalize(relocatedPath);
  try {
    webpackRequire.resolve(normalizedRelocatedPath);
    return normalizedRelocatedPath;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND')
      throw error;
    return normalizedPath;
  }
};
