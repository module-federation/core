'use client';
import React, { useState } from 'react';
import { sharedServerActions } from '@rsc-demo/shared-rsc';

export default function SharedCounterButton({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleIncrement() {
    setLoading(true);
    try {
      const result = await sharedServerActions.incrementSharedCounter();
      if (typeof result === 'number') {
        setCount(result);
      } else {
        setCount((c) => c + 1);
      }
    } catch (error) {
      console.error('Shared server action failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p>Client view of shared count: {count}</p>
      <button onClick={handleIncrement} disabled={loading}>
        {loading ? 'Updating…' : 'Increment shared counter'}
      </button>
    </div>
  );
}
