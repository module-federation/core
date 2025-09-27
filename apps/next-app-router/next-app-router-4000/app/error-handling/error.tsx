'use client';

import { Boundary } from '#/ui/boundary';
// import Button from 'remote_4001/Button';
import React from 'react';

export default function Error({ error, reset }: any) {
  React.useEffect(() => {
    console.log('logging error:', error);
  }, [error]);

  return (
    <Boundary labels={['./error.tsx']} color="pink">
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Error</h2>
        <p className="text-sm">{error?.message}</p>
        <div>
          <button
            onClick={() => reset()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
          {/* <Button onClick={() => reset()}>Try Again</Button> */}
        </div>
      </div>
    </Boundary>
  );
}
