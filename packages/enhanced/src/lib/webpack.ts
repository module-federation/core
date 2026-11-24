import type { Compiler } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

type WebpackBase = typeof import('webpack');

/**
 * Extended public webpack surface covering APIs exposed in webpack 5.113.0+
 * (webpack/webpack#22934) and future webpack 6, without requiring a repo-wide
 * webpack type upgrade.
 */
export type WebpackPublicApi = WebpackBase & {
  ModuleNotFoundError?: typeof import('webpack/lib/ModuleNotFoundError');
  dependencies?: WebpackBase['dependencies'] & {
    EntryDependency?: typeof import('webpack/lib/entry/EntryDependency');
    StaticExportsDependency?: typeof import('webpack/lib/dependencies/core/StaticExportsDependency');
  };
  sharing?: WebpackBase['sharing'] & {
    semver?: typeof import('webpack/lib/sharing/semver');
  };
  container?: WebpackBase['container'] & {
    extractUrlAndGlobal?: typeof import('webpack/lib/externals/extractUrlAndGlobal');
  };
  util?: WebpackBase['util'] & {
    getUndoPath?: (typeof import('webpack/lib/util/identifier'))['getUndoPath'];
    SortableSet?: typeof import('webpack/lib/util/SortableSet');
    SetHelpers?: typeof import('webpack/lib/util/SetHelpers');
  };
  javascript?: WebpackBase['javascript'] & {
    ChunkHelpers?: typeof import('webpack/lib/javascript/ChunkHelpers');
  };
  runtime?: WebpackBase['runtime'] & {
    StartupEntrypointRuntimeModule?: typeof import('webpack/lib/runtime/StartupEntrypointRuntimeModule');
  };
};

let activeWebpack: WebpackPublicApi | undefined;

export function setActiveWebpack(
  webpackInstance: Compiler['webpack'] | undefined,
): void {
  activeWebpack = webpackInstance as WebpackPublicApi | undefined;
}

export function getActiveWebpack(): WebpackPublicApi | undefined {
  return activeWebpack;
}

export function getWebpack(
  compiler?: { webpack?: Compiler['webpack'] } | null,
): WebpackPublicApi {
  if (compiler?.webpack) {
    return compiler.webpack as WebpackPublicApi;
  }
  if (activeWebpack) {
    return activeWebpack;
  }
  return require(normalizeWebpackPath('webpack')) as WebpackPublicApi;
}

export function getWebpackApi<T>(
  webpack: WebpackPublicApi | undefined,
  getter: (webpack: WebpackPublicApi) => T | undefined,
  legacyPath: string,
): T;
export function getWebpackApi<T, L>(
  webpack: WebpackPublicApi | undefined,
  getter: (webpack: WebpackPublicApi) => T | undefined,
  legacyPath: string,
  legacySelect: (legacyModule: L) => T,
): T;
export function getWebpackApi<T, L = T>(
  webpack: WebpackPublicApi | undefined,
  getter: (webpack: WebpackPublicApi) => T | undefined,
  legacyPath: string,
  legacySelect?: (legacyModule: L) => T,
): T {
  const target = webpack ?? getWebpack();
  const exposed = getter(target);
  if (exposed !== undefined) {
    return exposed;
  }
  const legacyModule = require(normalizeWebpackPath(legacyPath)) as L;
  return legacySelect
    ? legacySelect(legacyModule)
    : (legacyModule as unknown as T);
}

export function getRuntimeGlobals(
  webpack?: WebpackPublicApi,
): WebpackBase['RuntimeGlobals'] {
  const target = webpack ?? getWebpack();
  const globals = target.runtime?.RuntimeGlobals ?? target.RuntimeGlobals;
  if (globals) {
    return globals;
  }
  const fallback = getWebpack();
  return fallback.runtime?.RuntimeGlobals ?? fallback.RuntimeGlobals;
}

export function getRuntimeModule(
  webpack?: WebpackPublicApi,
): WebpackBase['RuntimeModule'] {
  const target = webpack ?? getWebpack();
  const runtimeModule = target.runtime?.RuntimeModule ?? target.RuntimeModule;
  if (runtimeModule) {
    return runtimeModule;
  }
  const fallback = getWebpack();
  return fallback.runtime?.RuntimeModule ?? fallback.RuntimeModule;
}
