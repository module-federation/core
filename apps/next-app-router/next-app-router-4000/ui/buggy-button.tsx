'use client';

import React, { Suspense } from 'react';

const Button = React.lazy(() => import('remote_4001/Button'));

export default function BuggyButton() {
  const [clicked, setClicked] = React.useState(false);

  if (clicked) {
    throw new Error('Oh no! Something went wrong.');
  }

  return (
    <Suspense
      fallback={
        <button className="rounded-lg bg-vercel-pink px-3 py-1 text-sm font-medium text-red-50 hover:bg-pink-600 hover:text-white">
          Trigger Error
        </button>
      }
    >
      <Button
        kind="error"
        onClick={() => {
          setClicked(true);
        }}
      >
        Trigger Error
      </Button>
    </Suspense>
  );
}
