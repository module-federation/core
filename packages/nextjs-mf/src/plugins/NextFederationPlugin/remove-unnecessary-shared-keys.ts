import type { moduleFederationPlugin } from '@module-federation/sdk';

/**
 * Function to remove unnecessary shared keys from the provided share scope.
 * It iterates over each key in the shared object and checks against the default share scope.
 * If a key is found in the default share scope, a warning is logged and the key is removed from the shared object.
 *
 * @param {Record<string, unknown>} shared - The shared object to be checked.
 * @param {moduleFederationPlugin.SharedObject} defaultShareScope - The default share scope to check against.
 */
export function removeUnnecessarySharedKeys(
  shared: Record<string, unknown>,
  defaultShareScope: moduleFederationPlugin.SharedObject,
): void {
  Object.keys(shared).forEach((key: string) => {
    /**
     * If the key is found in the default share scope, log a warning and remove the key from the shared object.
     */
    if (defaultShareScope[key]) {
      console.warn(
        `%c[nextjs-mf] You are sharing ${key} from the default share scope. This is not necessary and can be removed.`,
        'color: red',
      );
      delete (shared as { [key: string]: unknown })[key];
    }
  });
}
