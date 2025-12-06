'use server';

import {SharedClientWidget} from '@rsc-demo/shared-rsc';

export default function SharedDemo() {
  return (
    <section style={{border: '2px solid orange', padding: 16, margin: 16}}>
      <h2>Shared Package Demo (app2)</h2>
      <SharedClientWidget label="from app2" />
    </section>
  );
}
