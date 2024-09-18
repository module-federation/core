import { useEffect, useState } from 'react';
import type { defer } from 'react-router';

import logger from '../logger';
import { MFDataPrefetch, type prefetchOptions } from '../prefetch';
import { prefetch } from '../universal';
import { getScope } from '../common/runtime-utils';
import { useFirstMounted } from './utils';

type refetchParams = any;
type DeferredData = ReturnType<typeof defer>;
type prefetchReturnType<T> = [
  Promise<T>,
  (refetchParams?: refetchParams) => void,
];

type UsePrefetchOptions = prefetchOptions & {
  deferId?: string;
};

export const usePrefetch = <T>(
  options: UsePrefetchOptions,
): prefetchReturnType<T> => {
  const isFirstMounted = useFirstMounted();
  if (isFirstMounted) {
    const startTiming = performance.now();
    logger.info(
      `2. Start Get Prefetch Data: ${options.id} - ${
        options.functionId || 'default'
      } - ${startTiming}`,
    );
  }
  const { id, functionId, deferId } = options;
  const prefetchInfo = {
    id,
    functionId,
  };
  const mfScope = getScope();

  let state;
  const prefetchResult = prefetch(options);
  if (deferId) {
    if (prefetchResult instanceof Promise) {
      state = (prefetchResult as Promise<DeferredData>).then(
        (deferredData) => deferredData.data[deferId],
      );
    } else {
      state = (prefetchResult as DeferredData).data[deferId];
    }
  } else {
    state = prefetchResult;
  }
  const [prefetchState, setPrefetchState] = useState<Promise<T>>(
    state as Promise<T>,
  );
  const prefetchInstance = MFDataPrefetch.getInstance(mfScope);

  useEffect(() => {
    const useEffectTiming = performance.now();
    logger.info(
      `3. Start Execute UseEffect: ${options.id} - ${
        options.functionId || 'default'
      } - ${useEffectTiming}`,
    );

    return () => {
      prefetchInstance?.markOutdate(prefetchInfo, true);
    };
  }, []);

  const refreshExecutor = (refetchParams?: refetchParams) => {
    const refetchOptions = {
      ...options,
    };
    if (refetchParams) {
      refetchOptions.refetchParams = refetchParams;
    }
    prefetchInstance?.markOutdate(prefetchInfo, true);
    const newVal = prefetch(refetchOptions) as Promise<DeferredData>;
    let newState;
    if (deferId) {
      if (newVal instanceof Promise) {
        newState = newVal.then((deferredData) => deferredData.data[deferId]);
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
