import { MFDataPrefetch, type prefetchOptions } from '../prefetch';
import { getScope } from '../common/runtime-utils';

export function prefetch(options: prefetchOptions): Promise<any> {
  const { id, functionId } = options;
  const mfScope = getScope(id);

  const prefetchInstance =
    MFDataPrefetch.getInstance(mfScope) ||
    new MFDataPrefetch({
      name: mfScope,
    });

  const res = prefetchInstance.getProjectExports();
  if (res instanceof Promise) {
    const promise = res.then(() => {
      const result = prefetchInstance!.prefetch(options);
      prefetchInstance.memorize(id + functionId, result);
      return result;
    });
    return promise;
  } else {
    const result = prefetchInstance!.prefetch(options);
    prefetchInstance.memorize(id + functionId, result);
    return result;
  }
}
