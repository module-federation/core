'use server';

import {SharedClientWidget, sharedServerActions} from '@rsc-demo/shared-rsc';
import SharedCounterButton from './SharedCounterButton';

export default async function SharedDemo() {
  const count = sharedServerActions.getSharedCounter();
  return (
    <section style={{border: '2px solid teal', padding: 16, margin: 16}}>
      <h2>Shared Package Demo (app1)</h2>
      <SharedClientWidget label="from app1" />
      <div style={{marginTop: 12, padding: 8, background: '#f0f0f0'}}>
        <h3>Shared Server Actions</h3>
        <p>Current shared count (from server): {count}</p>
        <SharedCounterButton initialCount={count} />
      </div>
    </section>
  );
}
