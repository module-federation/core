import React, { MutableRefObject, ReactNode, Suspense, useRef } from 'react';

function isPromise<T>(obj: any): obj is PromiseLike<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}
export const AWAIT_ERROR_PREFIX =
  '<Await /> caught the following error during render: ';

export const IsAwaitErrorText = (text: string) =>
  typeof text === 'string' && text.indexOf(AWAIT_ERROR_PREFIX) === 0;

export interface AwaitProps<T> {
  resolve: T | Promise<T>;
  loading?: ReactNode;
  errorElement?: ReactNode | ((data?: string) => ReactNode);
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
    <Suspense fallback={loading}>
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
  if (typeof data === 'string' && data.indexOf(AWAIT_ERROR_PREFIX) === 0) {
    return (
      <>
        {typeof errorElement === 'function' ? errorElement(data) : errorElement}
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
