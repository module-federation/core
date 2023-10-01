import type { RemoteScope } from '../types';

/**
 *
 * @returns Returns the window or global object.
 */
export function getScope(): RemoteScope {
  return (typeof window !== 'undefined'
    ? window
    : //@ts-ignore
      global.__remote_scope__) as unknown as RemoteScope;
}
