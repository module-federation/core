import type { Compiler } from 'webpack';
import { WEBPACK_LAYERS, WebpackLayerName } from './constants';
import path from 'path';

export const defaultOverrides = {
  'styled-jsx': path.dirname(require.resolve('styled-jsx/package.json')),
  'styled-jsx/style': require.resolve('styled-jsx/style'),
  'styled-jsx/style.js': require.resolve('styled-jsx/style'),
};
/**
 * Safely resolves a module path using require.resolve.
 * Logs a warning and returns undefined if resolution fails.
 */
export const safeRequireResolve = (
  id: string,
  options?: {
    paths?: string[];
    mainFields?: string[];
    conditionNames?: string[];
  },
): string | undefined => {
  try {
    return require.resolve(id, options);
  } catch (e) {
    console.warn(
      `[nextjs-mf] Warning: Could not resolve '${id}'. Falling back.`,
      e,
    );
    return id;
  }
};

/**
 * Safely resolves a module path and attempts to require it to get its version.
 * Logs warnings and returns undefined if any step fails.
 */
export function getReactVersionSafely(
  aliasPath: string,
  context: string,
): string | undefined {
  const resolvedPath = safeRequireResolve(aliasPath, { paths: [context] });
  if (!resolvedPath || resolvedPath === aliasPath) {
    // Check if fallback was used
    // Warning potentially logged by safeRequireResolve or resolution failed
    return undefined;
  }
  try {
    // Attempt to require the *resolved* path
    const requiredModule = require(resolvedPath);
    const version = requiredModule.version;
    if (!version) {
      console.warn(
        `[nextjs-mf] Warning: Resolved '${aliasPath}' at '${resolvedPath}' but it has no 'version' property.`,
      );
      return undefined;
    }
    return version;
  } catch (error: any) {
    console.warn(
      `[nextjs-mf] Warning: Could not require resolved path '${resolvedPath}' for alias '${aliasPath}'. Error: ${error.message}`,
    );
    return undefined;
  }
}

/**
 * Gets the alias for a given name from the compiler's alias configuration.
 * If the alias doesn't exist, it returns the fallback value.
 */
export function getAlias(
  compiler: Compiler,
  aliasName: string,
  fallback: string,
): string {
  if (
    !compiler ||
    !compiler.options ||
    !compiler.options.resolve ||
    !compiler.options.resolve.alias
  ) {
    return fallback;
  }
  const aliasConfig = compiler.options.resolve.alias as Record<
    string,
    string | string[] | false
  >;
  return (
    (aliasConfig[aliasName] as string) ||
    (aliasConfig[aliasName.replace('$', '')] as string) ||
    fallback
  );
}

// Consider also moving createSharedConfig here if it makes sense
// For now, keeping it minimal with only the direct dependencies of the group functions

export function isWebpackServerOnlyLayer(
  layer: WebpackLayerName | null | undefined,
): boolean {
  return Boolean(
    layer && WEBPACK_LAYERS.GROUP.serverOnly.includes(layer as any),
  );
}

export function isWebpackClientOnlyLayer(
  layer: WebpackLayerName | null | undefined,
): boolean {
  return Boolean(
    layer && WEBPACK_LAYERS.GROUP.clientOnly.includes(layer as any),
  );
}

export function isWebpackDefaultLayer(
  layer: WebpackLayerName | null | undefined,
): boolean {
  return (
    layer === null ||
    layer === undefined ||
    layer === WEBPACK_LAYERS.pagesDirBrowser ||
    layer === WEBPACK_LAYERS.pagesDirEdge ||
    layer === WEBPACK_LAYERS.pagesDirNode
  );
}

export function isWebpackBundledLayer(
  layer: WebpackLayerName | null | undefined,
): boolean {
  return Boolean(layer && WEBPACK_LAYERS.GROUP.bundled.includes(layer as any));
}

export function isWebpackAppPagesLayer(
  layer: WebpackLayerName | null | undefined,
): boolean {
  return Boolean(layer && WEBPACK_LAYERS.GROUP.appPages.includes(layer as any));
}
