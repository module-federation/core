import React, {
  MutableRefObject,
  ReactNode,
  Suspense,
  useRef,
  useState,
} from 'react';
import logger from './logger';
import {
  DATA_FETCH_ERROR_PREFIX,
  LOAD_REMOTE_ERROR_PREFIX,
  ERROR_TYPE,
  DATA_FETCH_FUNCTION,
} from './constant';

import { getDataFetchIdWithErrorMsgs, wrapDataFetchId } from './utils';
import type { DataFetchParams } from './types';

function isPromise<T>(obj: any): obj is PromiseLike<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}
const AWAIT_ERROR_PREFIX =
  '<Await /> caught the following error during render: ';

export type ErrorInfo = {
  error: Error;
  errorType: number;
  dataFetchMapKey?: string;
};

export const transformError = (err: string | Error): ErrorInfo => {
  const errMsg = err instanceof Error ? err.message : err;
  const originalMsg = errMsg.replace(AWAIT_ERROR_PREFIX, '');
  const dataFetchMapKey = getDataFetchIdWithErrorMsgs(originalMsg);
  if (originalMsg.indexOf(DATA_FETCH_ERROR_PREFIX) === 0) {
    return {
      error: new Error(
        originalMsg
          .replace(DATA_FETCH_ERROR_PREFIX, '')
          .replace(wrapDataFetchId(dataFetchMapKey), ''),
      ),
      errorType: ERROR_TYPE.DATA_FETCH,
      dataFetchMapKey,
    };
  }
  if (originalMsg.indexOf(LOAD_REMOTE_ERROR_PREFIX) === 0) {
    return {
      error: new Error(
        originalMsg
          .replace(LOAD_REMOTE_ERROR_PREFIX, '')
          .replace(wrapDataFetchId(dataFetchMapKey), ''),
      ),
      errorType: ERROR_TYPE.LOAD_REMOTE,
      dataFetchMapKey,
    };
  }

  return {
    error: new Error(originalMsg.replace(wrapDataFetchId(dataFetchMapKey), '')),
    errorType: ERROR_TYPE.UNKNOWN,
    dataFetchMapKey,
  };
};

export interface AwaitProps<T> {
  resolve: T | Promise<T>;
  loading?: ReactNode;
  delayLoading?: number;
  errorElement?: ReactNode | ((errorInfo: ErrorInfo) => ReactNode);
  children: (data: T) => ReactNode;
  params?: DataFetchParams;
}

export interface AwaitErrorHandlerProps<T = any>
  extends Omit<AwaitProps<T>, 'resolve'> {
  resolve: () => T | string;
}

const DefaultLoading = <></>;
const DefaultErrorElement = (_data: any) => <div>Error</div>;

export function AwaitDataFetch<T>({
  resolve,
  loading = DefaultLoading,
  errorElement = DefaultErrorElement,
  children,
  params,
  delayLoading,
}: AwaitProps<T>) {
  const dataRef = useRef<T>();
  const data = dataRef.current || resolve;
  const getData = isPromise(data) ? fetchData(data, dataRef) : () => data;

  return (
    <AwaitSuspense
      params={params}
      loading={loading}
      errorElement={errorElement}
      delayLoading={delayLoading}
      // @ts-expect-error
      resolve={getData}
    >
      {children}
    </AwaitSuspense>
  );
}

export const DelayedLoading = ({
  delayLoading,
  children,
}: {
  delayLoading?: number;
  children: ReactNode;
}) => {
  const [show, setShow] = useState(false);
  const timerSet = useRef(false);

  if (!delayLoading) {
    return children;
  }

  if (typeof window !== 'undefined' && !show && !timerSet.current) {
    timerSet.current = true;
    setTimeout(() => {
      setShow(true);
    }, delayLoading);
  }

  return show ? children : null;
};

function AwaitSuspense<T>({
  resolve,
  children,
  loading = DefaultLoading,
  errorElement = DefaultErrorElement,
  delayLoading,
}: AwaitErrorHandlerProps<T>) {
  return (
    <Suspense
      fallback={
        <DelayedLoading delayLoading={delayLoading}>{loading}</DelayedLoading>
      }
    >
      <ResolveAwait resolve={resolve} errorElement={errorElement}>
        {children}
      </ResolveAwait>
    </Suspense>
  );
}

function ResolveAwait<T>({
  children,
  resolve,
  errorElement,
  params,
}: AwaitErrorHandlerProps<T>) {
  const data = resolve();
  logger.debug('resolve data: ', data);
  if (typeof data === 'string' && data.indexOf(AWAIT_ERROR_PREFIX) === 0) {
    const transformedError = transformError(data);
    return (
      <>
        {typeof errorElement === 'function' ? (
          <>
            {globalThis.FEDERATION_SSR && (
              <script
                suppressHydrationWarning
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: String.raw`
                  globalThis['${DATA_FETCH_FUNCTION}'] = globalThis['${DATA_FETCH_FUNCTION}']  || []
                  globalThis['${DATA_FETCH_FUNCTION}'].push([${transformedError.dataFetchMapKey ? `'${transformedError.dataFetchMapKey}'` : ''},${params ? JSON.stringify(params) : null},true]);`,
                }}
              ></script>
            )}
            {errorElement(transformedError)}
          </>
        ) : (
          errorElement
        )}
      </>
    );
  }
  const toRender =
    typeof children === 'function' ? children(data as T) : children;
  return <>{toRender}</>;
}

// return string when promise is rejected
const fetchData = <T,>(promise: Promise<T>, ref: MutableRefObject<T>) => {
  let data: T | string;
  let status: 'pending' | 'success' = 'pending';
  const suspender = promise
    .then((res) => {
      status = 'success';
      data = res;
      ref.current = res;
    })
    .catch((e) => {
      status = 'success';
      console.warn(e);
      data = AWAIT_ERROR_PREFIX + e;
    });
  return () => {
    if (status === 'pending') {
      throw suspender;
    }
    return data;
  };
};
