'use client';
import React, {useState} from 'react';
// This import is transformed by the server-action-client-loader
// into a createServerReference call at build time
import {incrementCount} from './server-actions';
// Test default export action (for P1 bug regression test)
import testDefaultAction from './test-default-action';

export default function DemoCounterButton({initialCount}) {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function increment() {
    setLoading(true);
    try {
      // incrementCount is now a server reference that calls the server action
      const result = await incrementCount();

      if (typeof result === 'number') {
        setCount(result);
      } else {
        setCount((c) => c + 1);
      }
    } catch (error) {
      console.error('Server action failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p>Client view of count: {count}</p>
      <button onClick={increment} disabled={loading}>
        {loading ? 'Updating…' : 'Increment on server'}
      </button>
    </div>
  );
}
