/**
 * Metro Compatibility Layer
 *
 * Provides backwards-compatible imports for Metro 0.82 and 0.83+
 *
 * Metro 0.83 introduced a restrictive `exports` field that only allows
 * `metro/private/*` paths instead of direct `metro/src/*` imports.
 *
 * This module dynamically resolves the correct import path based on the
 * installed Metro version, ensuring compatibility with both versions.
 */

// Type-only imports — resolved at compile-time via metro/src/*.d.ts, erased at runtime
import type DefaultServer from 'metro/src/Server';
import type DefaultBaseJSBundle from 'metro/src/DeltaBundler/Serializers/baseJSBundle';
import type DefaultCountingSet from 'metro/src/lib/CountingSet';
import type DefaultBundleToString from 'metro/src/lib/bundleToString';
import type { MixedSourceMap } from 'metro-source-map';

/**
 * Resolves and imports a Metro module, trying 0.83 path first then 0.82 fallback.
 * Uses require.resolve() before require() so resolution failures (wrong path)
 * are separated from load errors (broken module), enabling better diagnostics.
 */
function resolveAndImport(metro83Path: string, metro82Path: string) {
  let resolvedPath: string;
  try {
    resolvedPath = require.resolve(metro83Path);
  } catch {
    try {
      resolvedPath = require.resolve(metro82Path);
    } catch {
      throw new Error(
        `Could not resolve 'metro' module. Tried:\n` +
          `  - ${metro83Path}\n` +
          `  - ${metro82Path}\n` +
          `Ensure 'metro' is installed.`,
      );
    }
  }
  return require(resolvedPath);
}

function getDefaultExport(mod: any) {
  if (mod != null && typeof mod === 'object' && 'default' in mod) {
    return mod.default;
  }
  return mod;
}

// Server class
export const Server = getDefaultExport(
  resolveAndImport('metro/private/Server', 'metro/src/Server'),
) as typeof DefaultServer;
export type Server = DefaultServer;

// DeltaBundler Serializers
export const baseJSBundle = getDefaultExport(
  resolveAndImport(
    'metro/private/DeltaBundler/Serializers/baseJSBundle',
    'metro/src/DeltaBundler/Serializers/baseJSBundle',
  ),
) as typeof DefaultBaseJSBundle;

// Utility classes
export const CountingSet = getDefaultExport(
  resolveAndImport(
    'metro/private/lib/CountingSet',
    'metro/src/lib/CountingSet',
  ),
) as typeof DefaultCountingSet;

// Bundle utilities
export const bundleToString = getDefaultExport(
  resolveAndImport(
    'metro/private/lib/bundleToString',
    'metro/src/lib/bundleToString',
  ),
) as typeof DefaultBundleToString;

const relativizeSourceMapModule = resolveAndImport(
  'metro/private/lib/relativizeSourceMap',
  'metro/src/lib/relativizeSourceMap',
);
export const relativizeSourceMapInline: (
  sourceMap: MixedSourceMap,
  sourcesRoot: string,
) => void =
  relativizeSourceMapModule.relativizeSourceMapInline ||
  getDefaultExport(relativizeSourceMapModule);

// Re-export types - these come from metro/src/shared/types in both versions
// The types themselves are available through the main 'metro' package export
export type { RequestOptions, OutputOptions } from 'metro/src/shared/types';
