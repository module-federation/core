'use client';

import React, { Suspense } from 'react';

const Button = React.lazy(() => import('remote_4001/Button'));

export default function RemoteButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <button className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white">
          {children}
        </button>
      }
    >
      <Button>{children}</Button>
    </Suspense>
  );
}
