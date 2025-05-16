import React, { MutableRefObject, ReactNode, Suspense, useRef } from 'react';
import logger from './logger';
import {
  DATA_FETCH_ERROR_PREFIX,
  LOAD_REMOTE_ERROR_PREFIX,
  ERROR_TYPE,
} from '../constant';

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
  err: Error;
  errorType: number;
};

const transformError = (errMsg: string): ErrorInfo => {
  const originalMsg = errMsg.replace(AWAIT_ERROR_PREFIX, '');
  if (originalMsg.indexOf(DATA_FETCH_ERROR_PREFIX) === 0) {
    return {
      err: new Error(originalMsg.replace(DATA_FETCH_ERROR_PREFIX, '')),
      errorType: ERROR_TYPE.DATA_FETCH,
    };
  }
  if (originalMsg.indexOf(LOAD_REMOTE_ERROR_PREFIX) === 0) {
    return {
      err: new Error(originalMsg.replace(LOAD_REMOTE_ERROR_PREFIX, '')),
      errorType: ERROR_TYPE.LOAD_REMOTE,
    };
  }

  return {
    err: new Error(originalMsg),
    errorType: ERROR_TYPE.UNKNOWN,
  };
};

export interface AwaitProps<T> {
  resolve: T | Promise<T>;
  loading?: ReactNode;
  errorElement?: ReactNode | ((errorInfo: ErrorInfo) => ReactNode);
  children: (data: T) => ReactNode;
}

export interface AwaitErrorHandlerProps<T = any>
  extends Omit<AwaitProps<T>, 'resolve'> {
  resolve: () => T | string;
}

const DefaultLoading = <></>;
const DefaultErrorElement = (_data: any) => <div>Error</div>;

export function Await<T>({
  resolve,
  loading = DefaultLoading,
  errorElement = DefaultErrorElement,
  children,
}: AwaitProps<T>) {
  const dataRef = useRef<T>();
  const data = dataRef.current || resolve;
  const getData = isPromise(data) ? fetchData(data, dataRef) : () => data;

  return (
    <AwaitSuspense
      loading={loading}
      errorElement={errorElement}
      // @ts-ignore
      resolve={getData}
    >
      {children}
    </AwaitSuspense>
  );
}

function AwaitSuspense<T>({
  resolve,
  children,
  loading = DefaultLoading,
  errorElement = DefaultErrorElement,
}: AwaitErrorHandlerProps<T>) {
  return (
    <Suspense>
      <ResolveAwait
        resolve={resolve}
        loading={loading}
        errorElement={errorElement}
      >
        {children}
      </ResolveAwait>
    </Suspense>
  );
}

function ResolveAwait<T>({
  children,
  resolve,
  loading,
  errorElement,
}: AwaitErrorHandlerProps<T>) {
  const data = resolve();
  logger.debug('resolve data: ', data);
  if (typeof data === 'string' && data.indexOf(AWAIT_ERROR_PREFIX) === 0) {
    return (
      <>
        {typeof errorElement === 'function' ? (
          <>
            {/* TODO: set _mfSSRDowngrade */}
            <script
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: String.raw`
                  globalThis._MF__DATA_FETCH_ID_MAP__ = globalThis._MF__DATA_FETCH_ID_MAP__ || {};
    globalThis._MF__DATA_FETCH_ID_MAP__['_mfSSRDowngrade'] = true;
 `,
              }}
            ></script>
            {errorElement(transformError(data))}
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
