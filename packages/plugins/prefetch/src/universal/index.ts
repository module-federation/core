import { FederationPrefetch, prefetchOptions } from '../prefetch';
import { getScope } from '../utils';

export function prefetch(options: prefetchOptions): Promise<any> {
  const { id, functionId } = options;
  const federationScope = getScope(id);

  const federationPrefetch =
    FederationPrefetch.getInstance(federationScope) ||
    new FederationPrefetch({
      name: federationScope,
    });

  const res = federationPrefetch.getProjectExports();
  if (res instanceof Promise) {
    const promise = res.then(() => {
      const result = federationPrefetch!.prefetch(options);
      federationPrefetch.memorize(id + functionId, result);
      return result;
    });
    return promise;
  } else {
    const result = federationPrefetch!.prefetch(options);
    federationPrefetch.memorize(id + functionId, result);
    return result;
  }
}
