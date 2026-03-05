'use client';

import { Boundary } from '#/ui/boundary';
import React, { Suspense } from 'react';

const Button = React.lazy(() => import('remote_4001/Button'));

export default function Error({ error, reset }: any) {
  React.useEffect(() => {
    console.log('logging error:', error);
  }, [error]);

  return (
    <Boundary
      labels={['./[categorySlug]/[subCategorySlug]/error.tsx']}
      color="pink"
    >
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Error</h2>
        <p className="text-sm">{error?.message}</p>
        <div>
          <Suspense
            fallback={
              <button className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white">
                Try Again
              </button>
            }
          >
            <Button onClick={() => reset()}>Try Again</Button>
          </Suspense>
        </div>
      </div>
    </Boundary>
  );
}
