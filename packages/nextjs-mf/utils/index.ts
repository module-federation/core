/**
 * Extracts the URL and global from the module federation utilities.
 * @module @module-federation/utilities/src/utils/pure
 */
export { extractUrlAndGlobal } from '@module-federation/utilities';
import { injectScript as injectLegacy } from '@module-federation/utilities';

export const injectScript = function (args: any): any {
  console.error(
    '@module-federation/utilities injectScript is deprecated, use module-federation/runtime {init,loadRemote}',
  );
  return injectLegacy(args);
};

/**
 * Flushes chunks from the module federation node utilities.
 * @module @module-federation/node/utils
 */
export { flushChunks } from '@module-federation/node/utils';

/**
 * Exports the FlushedChunks component from the current directory.
 */
export { FlushedChunks } from './flushedChunks';

/**
 * Exports the FlushedChunksProps type from the current directory.
 */
export type { FlushedChunksProps } from './flushedChunks';

/**
 * Revalidates the current state.
 * If the function is called on the client side, it logs an error and returns a resolved promise with false.
 * If the function is called on the server side, it imports the revalidate function from the module federation node utilities and returns the result of calling that function.
 * @returns {Promise<boolean>} A promise that resolves with a boolean.
 */
export const revalidate = function (
  fetchModule: any = undefined,
  force: boolean = false,
): Promise<boolean> {
  if (typeof window !== 'undefined') {
    console.error('revalidate should only be called server-side');
    return Promise.resolve(false);
  }
  return import('@module-federation/node/utils').then(function (utils) {
    return utils.revalidate(fetchModule, force);
  });
};
