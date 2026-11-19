import type webpack from 'webpack';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const callerWebpack = new Map<
  string,
  { request: NodeRequire; root: string | undefined }
>();

const createSdkWebpackRequire = (): NodeRequire =>
  createRequire(
    // This entrypoint is emitted as both CJS and ESM.
    // @ts-ignore import.meta is used only in the ESM output.
    process.env.IS_ESM_BUILD === 'true' ? import.meta.url : __filename,
  );

const getWebpackRequire = (): {
  request: NodeRequire;
  root: string | undefined;
} => {
  if (process.env['FEDERATION_WEBPACK_PATH']) {
    webpackRequire ??= createSdkWebpackRequire();
    return { request: webpackRequire, root: undefined };
  }

  // The SDK has no runtime webpack dependency. Use the calling package's resolver.
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
    const callerFile = caller?.startsWith('file:')
      ? fileURLToPath(caller)
      : caller || resolve(process.cwd(), 'package.json');
    const callerDir = dirname(callerFile);
    let located = callerWebpack.get(callerDir);
    if (!located) {
      const request = createRequire(callerFile);
      const webpackRoot = findWebpackRoot(request);
      located = {
        request,
        root: webpackRoot ? realpathSync(webpackRoot) + sep : undefined,
      };
      callerWebpack.set(callerDir, located);
    }
    return located;
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

const findWebpackRoot = (request: NodeRequire): string | undefined => {
  let entry: string;
  try {
    entry = request.resolve('webpack');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      return undefined;
    }
    throw error;
  }
  for (let dir = dirname(entry); dir !== dirname(dir); dir = dirname(dir)) {
    const manifest = join(dir, 'package.json');
    if (
      existsSync(manifest) &&
      JSON.parse(readFileSync(manifest, 'utf8')).name === 'webpack'
    ) {
      return dir;
    }
  }
  return undefined;
};

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

  const { request: requestWebpack, root } = getWebpackRequire();
  const resolves = (request: string, inside?: string): boolean => {
    try {
      // Resolve candidates without executing them.
      const resolved = requestWebpack.resolve(request);
      return !inside || realpathSync(resolved).startsWith(inside);
    } catch (error) {
      const { code } = error as NodeJS.ErrnoException;
      if (
        code === 'MODULE_NOT_FOUND' ||
        (inside && code === 'ERR_PACKAGE_PATH_NOT_EXPORTED')
      ) {
        return false;
      }
      throw error;
    }
  };

  if (root) {
    // Bare requests can find an ancestor webpack's internals. Accept only
    // candidates inside the caller's webpack, including PnP and exports maps.
    if (resolves(fullPath, root)) return fullPath;
    if (resolves(relocatedPath, root)) return relocatedPath;
  }

  if (resolves(candidate)) {
    return candidate;
  }
  const fallback = normalize(relocatedPath);
  requestWebpack.resolve(fallback);
  return fallback;
};
