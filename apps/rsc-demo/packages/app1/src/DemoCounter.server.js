import React from 'react';
import DemoCounterButton from './DemoCounterButton';
import {getCount} from './server-actions';

export default async function DemoCounter() {
  const count = getCount();
  return (
    <section style={{marginTop: 24, padding: 16, border: '1px solid #ccc'}}>
      <h2>Server Action Demo</h2>
      <p>Current count (fetched on server render): {count}</p>
      <DemoCounterButton initialCount={count} />
    </section>
  );
}
