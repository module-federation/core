import { RemoteScope } from '../types';

/**
 *
 * @returns Returns the window or global object.
 */
export const getScope = (): RemoteScope => {
  return (typeof window !== 'undefined'
    ? window
    : //@ts-ignore
      global.__remote_scope__) as unknown as RemoteScope;
};
