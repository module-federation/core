'use server';

import {SharedClientWidget} from '@rsc-demo/shared-rsc';

export default function SharedDemo() {
  return (
    <section style={{border: '2px solid teal', padding: 16, margin: 16}}>
      <h2>Shared Package Demo (app1)</h2>
      <SharedClientWidget label="from app1" />
    </section>
  );
}
