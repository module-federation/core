import * as React from 'react';

export {
  extractUrlAndGlobal,
  injectScript,
} from '@ranshamay/utilities';
// @ts-ignore
export { flushChunks } from '@module-federation/node/utils';
export { FlushedChunks } from './flushedChunks';
export type { FlushedChunksProps } from './flushedChunks';

export const revalidate = () => {
  if (typeof window !== 'undefined') {
    console.error('revalidate should only be called server-side');
    return Promise.resolve(false);
  }
  // @ts-ignore
  return import('@ranshamay/node/utils').then((utils) => {
    return utils.revalidate();
  });
};
