import * as React from 'react';

export {
  extractUrlAndGlobal,
  injectScript,
} from '@module-federation/utilities/src/utils/common';
// @ts-ignore
export { flushChunks } from '@module-federation/node/utils';
export { FlushedChunks, FlushedChunksProps } from './flushedChunks';

export const revalidate = () => {
  if (typeof window !== 'undefined') {
    console.error('revalidate should only be called server-side');
    return Promise.resolve(false);
  }
  // @ts-ignore
  return import('@module-federation/node/utils').then((utils) => {
    return utils.revalidate();
  });
};
