/**
 * Extracts the URL and global from the module federation utilities.
 * @module @module-federation/utilities/src/utils/pure
 */
export { extractUrlAndGlobal } from '@module-federation/utilities';

/**
 * Injects a script from the module federation utilities.
 * @module @module-federation/utilities/src/utils/common
 */
export { injectScript } from '@module-federation/utilities';

/**
 * Flushes chunks from the module federation node utilities.
 * @module @module-federation/node/utils
 */
// @ts-ignore
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
export const revalidate = (fetchModule: any = undefined, force = false) => {
  if (typeof window !== 'undefined') {
    console.error('revalidate should only be called server-side');
    return Promise.resolve(false);
  }
  // @ts-ignore
  return import('@module-federation/node/utils').then((utils) => {
    return utils.revalidate(fetchModule, force);
  });
};
