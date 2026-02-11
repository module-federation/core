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
 * Attempts to import from Metro 0.83 format first, falls back to 0.82 format
 */
function tryImport(metro83Path: string, metro82Path: string) {
  try {
    return require(metro83Path);
  } catch {
    return require(metro82Path);
  }
}

function getDefaultExport(mod: any) {
  // CJS interop: if the module has a .default that is a function or object, use it
  // Otherwise return the module itself (already the direct export)
  if (mod != null && typeof mod === 'object' && 'default' in mod) {
    return mod.default;
  }
  return mod;
}

// Server class
export const Server = getDefaultExport(
  tryImport('metro/private/Server', 'metro/src/Server'),
) as typeof DefaultServer;

// DeltaBundler Serializers
export const baseJSBundle = getDefaultExport(
  tryImport(
    'metro/private/DeltaBundler/Serializers/baseJSBundle',
    'metro/src/DeltaBundler/Serializers/baseJSBundle',
  ),
) as typeof DefaultBaseJSBundle;

// Utility classes
export const CountingSet = getDefaultExport(
  tryImport('metro/private/lib/CountingSet', 'metro/src/lib/CountingSet'),
) as typeof DefaultCountingSet;

// Bundle utilities
export const bundleToString = getDefaultExport(
  tryImport('metro/private/lib/bundleToString', 'metro/src/lib/bundleToString'),
) as typeof DefaultBundleToString;

const relativizeSourceMapModule = tryImport(
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
