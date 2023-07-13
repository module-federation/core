import { RemoteScope } from '../types';

/**
 *
 * @returns Returns the window or global object.
 */
export const getScope = (): RemoteScope => {
  return (typeof window === 'undefined'
    ? global
    : window) as unknown as RemoteScope;
};
