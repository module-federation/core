/**
 * This module exports the injectTopLoader function.
 * @module injectTopLoader
 */
import type { LoaderContext } from 'webpack';

/**
 * This function injects a delegate module hoist import at the top of the source code.
 * @function injectTopLoader
 * @param {LoaderContext<Record<string, unknown>>} this - The loader context.
 * @param {string} source - The source code to be injected with the delegate module hoist import.
 * @returns {string} The source code with the delegate module hoist import injected at the top.
 */
function injectTopLoader(
  this: LoaderContext<Record<string, unknown>>,
  source: string,
): string {
  const delegateModuleHoistImport =
    "require('@module-federation/nextjs-mf/src/internal-delegate-hoist');\n";

  return `${delegateModuleHoistImport}${source}`;
}

export default injectTopLoader;
