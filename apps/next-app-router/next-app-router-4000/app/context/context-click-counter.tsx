'use client';

import { useCounter } from './counter-context';
import React, { Suspense } from 'react';
import { Boundary } from '#/ui/boundary';

const Button = React.lazy(() => import('remote_4001/Button'));

const ContextClickCounter = () => {
  const [count, setCount] = useCounter();

  return (
    <Boundary
      labels={['Counter Context [Client Component]']}
      color="blue"
      size="small"
      animateRerendering={false}
    >
      <Suspense
        fallback={
          <button className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white">
            testing
          </button>
        }
      >
        <Button>testing</Button>
      </Suspense>
      <button
        onClick={() => setCount(count + 1)}
        className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium tabular-nums text-gray-100 hover:bg-gray-500 hover:text-white"
      >
        {count} Clicks
      </button>
    </Boundary>
  );
};

export const Counter = () => {
  const [count] = useCounter();

  return (
    <Boundary
      labels={['Counter Context [Client Component]']}
      color="blue"
      size="small"
      animateRerendering={false}
    >
      <div className="span text-xl font-bold text-white">
        <span className="tabular-nums">{count}</span> Clicks
      </div>
    </Boundary>
  );
};

export default ContextClickCounter;
