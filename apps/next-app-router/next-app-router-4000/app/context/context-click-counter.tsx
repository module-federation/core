'use client';

import React from 'react';
import Button from '#/ui/button';

export default function ContextClickCounter() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="space-y-4">
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
    </div>
  );
}
