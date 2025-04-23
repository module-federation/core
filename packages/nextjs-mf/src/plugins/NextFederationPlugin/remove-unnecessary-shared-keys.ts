/**
 * Utility function to remove unnecessary shared keys from the default share scope.
 * It checks each key in the shared object against the default share scope.
 * If a key is found in the default share scope, a warning is logged and the key is removed from the shared object.
 *
 * @param {Record<string, unknown>} shared - The shared object to be checked.
 */
import type { Compiler } from 'webpack';
import { getShareScope } from '../../internal';

/**
 * Function to remove unnecessary shared keys from the default share scope.
 * It iterates over each key in the shared object and checks against the default share scope
 * generated based on the compiler context.
 * If a key is found in the default share scope, a warning is logged and the key is removed.
 *
 * @param {Record<string, unknown>} shared - The shared object to be checked.
 * @param {Compiler} compiler - The webpack compiler instance.
 */
export function removeUnnecessarySharedKeys(
  shared: Record<string, unknown>,
  compiler: Compiler,
): void {
  const defaultScope = getShareScope(compiler);

  Object.keys(shared).forEach((key: string) => {
    /**
     * If the key is found in the default share scope, log a warning and remove the key from the shared object.
     */
    if (defaultScope[key]) {
      console.warn(
        `%c[nextjs-mf] You are sharing ${key} from the default share scope. This is not necessary and can be removed.`,
        'color: red',
      );
      delete (shared as { [key: string]: unknown })[key];
    }
  });
}
