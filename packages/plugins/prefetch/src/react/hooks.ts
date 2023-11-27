import { useState, useEffect } from 'react';
import { defer } from 'react-router';

import { FederationPrefetch, prefetchOptions } from '../prefetch';
import { getScope } from '../utils';
import { prefetch } from '../universal';

type refetchParams = any;
type DeferredData = ReturnType<typeof defer>;
type prefetchReturnType<T> = [
  Promise<T>,
  (refetchParams?: refetchParams) => void,
];

export const usePrefetch = <T>(
  options: prefetchOptions & {
    deferId?: string;
  },
): prefetchReturnType<T> => {
  const { id, functionId, deferId } = options;
  const prefetchInfo = {
    id,
    functionId,
  };
  const federationScope = getScope(id);

  let state;
  const prefetchResult = prefetch(options);
  if (deferId) {
    if (prefetchResult instanceof Promise) {
      state = (prefetchResult as Promise<DeferredData>).then(
        deferredData => deferredData.data[deferId],
      );
    } else {
      state = (prefetchResult as DeferredData).data[deferId];
    }
  } else {
    state = prefetchResult;
  }
  const [prefetchState, setPrefetchState] = useState<Promise<T>>(state as Promise<T>);

  const federationPrefetch = FederationPrefetch.getInstance(federationScope);

  useEffect(
    () => () => {
      federationPrefetch?.markOutdate(prefetchInfo, true);
    },
    [],
  );

  const refreshExecutor = (refetchParams?: refetchParams) => {
    const refetchOptions = {
      ...options,
    };
    if (refetchParams) {
      refetchOptions.refetchParams = refetchParams;
    }
    federationPrefetch?.markOutdate(prefetchInfo, true);
    const newVal = prefetch(refetchOptions) as Promise<DeferredData>;
    let newState;
    if (deferId) {
      if (newVal instanceof Promise) {
        newState = newVal.then(deferredData => deferredData.data[deferId]);
      } else {
        newState = (newVal as DeferredData).data[deferId];
      }
    } else {
      newState = newVal;
    }

    setPrefetchState(newState as Promise<T>);
  };

  return [prefetchState, refreshExecutor];
};
