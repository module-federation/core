import type { Compiler } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

// These exports were added after our minimum supported webpack version.
type Webpack = typeof import('webpack') & {
  ModuleFactory?: typeof import('webpack/lib/ModuleFactory');
  ModuleNotFoundError?: typeof import('webpack/lib/ModuleNotFoundError');
  dependencies: {
    EntryDependency?: typeof import('webpack/lib/dependencies/EntryDependency');
    StaticExportsDependency?: typeof import('webpack/lib/dependencies/StaticExportsDependency');
  };
  container: {
    extractUrlAndGlobal?: typeof import('webpack/lib/util/extractUrlAndGlobal');
  };
  sharing: {
    semver?: typeof import('webpack/lib/util/semver');
  };
  util: {
    makeSerializable?: typeof import('webpack/lib/util/makeSerializable');
    SortableSet?: typeof import('webpack/lib/util/SortableSet');
    SetHelpers?: typeof import('webpack/lib/util/SetHelpers');
    getUndoPath?: (typeof import('webpack/lib/util/identifier'))['getUndoPath'];
  };
  javascript: {
    ChunkHelpers?: typeof import('webpack/lib/javascript/ChunkHelpers');
  };
  runtime: {
    StartupEntrypointRuntimeModule?: typeof import('webpack/lib/runtime/StartupEntrypointRuntimeModule');
  };
};

export function getWebpack(compiler?: Compiler): Webpack {
  // Module subclasses are loaded by the wrapper after it selects the compiler.
  // Public container exports can also be read before a compiler is created.
  return compiler?.webpack || require(normalizeWebpackPath('webpack'));
}

export function getWebpackModule<T>(
  publicExport: T | undefined,
  legacyRequest: string,
  relocatedRequest?: string,
): T {
  if (publicExport !== undefined) return publicExport;

  const request = normalizeWebpackPath(legacyRequest);
  let resolved: string;
  try {
    resolved = require.resolve(request);
  } catch (error) {
    if (
      !relocatedRequest ||
      (error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND'
    ) {
      throw error;
    }
    // webpack 5.112.0 moved these files before exposing their public exports.
    resolved = require.resolve(normalizeWebpackPath(relocatedRequest));
  }
  // A missing dependency inside a resolved module must not trigger a fallback.
  return require(resolved);
}
