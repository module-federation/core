import type webpack from 'webpack';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { isAbsolute, join, resolve, sep } from 'node:path';

// Webpack 5.112 reorganized internals without retaining every old location.
// Keep the old layout preferred for older installations and patched copies.
const webpackInternalPaths: Record<string, string> = {
  'webpack/lib/Module': 'webpack/lib/module/Module',
  'webpack/lib/ModuleFactory': 'webpack/lib/module/ModuleFactory',
  'webpack/lib/NormalModuleFactory': 'webpack/lib/module/NormalModuleFactory',
  'webpack/lib/ExternalModule': 'webpack/lib/externals/ExternalModule',
  'webpack/lib/RuntimeModule': 'webpack/lib/runtime/RuntimeModule',
  'webpack/lib/RuntimeGlobals': 'webpack/lib/runtime/RuntimeGlobals',
  'webpack/lib/RuntimeTemplate': 'webpack/lib/template/RuntimeTemplate',
  'webpack/lib/ResolverFactory': 'webpack/lib/resolve/ResolverFactory',
  'webpack/lib/ChunkGraph': 'webpack/lib/graph/ChunkGraph',
  'webpack/lib/HotUpdateChunk': 'webpack/lib/graph/HotUpdateChunk',
  'webpack/lib/dependencies/EntryDependency':
    'webpack/lib/entry/EntryDependency',
  'webpack/lib/dependencies/ModuleDependency':
    'webpack/lib/dependencies/core/ModuleDependency',
  'webpack/lib/dependencies/StaticExportsDependency':
    'webpack/lib/dependencies/core/StaticExportsDependency',
  'webpack/lib/util/extractUrlAndGlobal':
    'webpack/lib/externals/extractUrlAndGlobal',
  'webpack/lib/util/fs': 'webpack/lib/fs/fs',
  'webpack/lib/util/semver': 'webpack/lib/sharing/semver',
};

let webpackRequire: NodeRequire | undefined;

const createSdkWebpackRequire = (): NodeRequire =>
  createRequire(
    // This entrypoint is emitted as both CJS and ESM.
    // @ts-ignore import.meta is used only in the ESM output.
    process.env.IS_ESM_BUILD === 'true' ? import.meta.url : __filename,
  );

const getWebpackRequire = (): NodeRequire => {
  if (process.env['FEDERATION_WEBPACK_PATH']) {
    webpackRequire ??= createSdkWebpackRequire();
    return webpackRequire;
  }

  // Resolve undeclared peer internals from the package calling this helper,
  // rather than from the SDK (which does not depend on Webpack at runtime).
  const prepareStackTrace = Error.prepareStackTrace;
  const stackTraceLimit = Error.stackTraceLimit;
  try {
    Error.prepareStackTrace = (_error, callSites) => callSites;
    Error.stackTraceLimit = Math.max(stackTraceLimit ?? 0, 10);
    const error = new Error();
    Error.captureStackTrace(error, getWebpackRequire);
    const callSites = error.stack as unknown;
    const caller = (Array.isArray(callSites) ? callSites : [])
      .slice(1)
      .map((callSite: NodeJS.CallSite) => callSite.getFileName())
      .find(
        (fileName): fileName is string =>
          !!fileName && (isAbsolute(fileName) || fileName.startsWith('file:')),
      );
    return createRequire(caller || resolve(process.cwd(), 'package.json'));
  } finally {
    Error.prepareStackTrace = prepareStackTrace;
    Error.stackTraceLimit = stackTraceLimit;
  }
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
    if (!webpackPath) {
      return '';
    }
    try {
      const entry = createRequire(webpackPath).resolve('webpack');
      // A bundled compiler resolves to an unrelated installation, or to none.
      // Only report the package that contains the active compiler.
      return webpackPath.startsWith(resolve(entry, '../..') + sep) ? entry : '';
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
      return '';
    }
  }
}

export const normalizeWebpackPath = (fullPath: string): string => {
  if (fullPath === 'webpack') {
    return process.env['FEDERATION_WEBPACK_PATH'] || fullPath;
  }

  const normalize = (path: string): string =>
    process.env['FEDERATION_WEBPACK_PATH']
      ? resolve(
          process.env['FEDERATION_WEBPACK_PATH'],
          path.replace('webpack', '../../'),
        )
      : path;
  const candidate = normalize(fullPath);
  const relocatedPath = webpackInternalPaths[fullPath];
  if (!relocatedPath) {
    return candidate;
  }

  const requestWebpack = getWebpackRequire();
  const exists = (request: string): boolean => {
    try {
      // Resolve only: never execute a module while choosing its layout.
      requestWebpack.resolve(request);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
      return false;
    }
  };

  if (!process.env['FEDERATION_WEBPACK_PATH']) {
    // A bare request keeps walking up node_modules when the nearest Webpack
    // lacks the file, which would mix internals from two Webpack copies.
    // Choose the layout inside the copy the caller resolves instead.
    const nearest = requestWebpack.resolve
      .paths('webpack')
      ?.find((directory) => existsSync(join(directory, 'webpack')));
    if (nearest) {
      if (exists(join(nearest, fullPath))) {
        return fullPath;
      }
      // A missing fallback must propagate instead of returning an unusable path.
      requestWebpack.resolve(join(nearest, relocatedPath));
      return relocatedPath;
    }
  }

  if (exists(candidate)) {
    return candidate;
  }
  const fallback = normalize(relocatedPath);
  // A missing fallback, package exports restriction, or other resolution error
  // must propagate instead of returning an unusable path.
  requestWebpack.resolve(fallback);
  return fallback;
};
