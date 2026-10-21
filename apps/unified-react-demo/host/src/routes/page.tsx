import React, { useState } from 'react';
import { createReactRemote } from '../createReactRemote';
import './style.css';
const loading = <p>Loading remote…</p>;
const cases = [
  ['id / plain SSR', createReactRemote({ id: 'remote/Plain', loading })],
  ['id / data SSR', createReactRemote({ id: 'remote/Data', loading })],
  ['id / application', createReactRemote({ id: 'remote/App', loading })],
  [
    'loader / plain SSR',
    createReactRemote({ loader: () => import('remote/Plain'), loading }),
  ],
  [
    'loader / data SSR',
    createReactRemote({ loader: () => import('remote/DataByLoader'), loading }),
  ],
  [
    'loader / application',
    createReactRemote({ loader: () => import('remote/App'), loading }),
  ],
  [
    'loader wins over conflicting id',
    createReactRemote({
      id: 'remote/App',
      loader: () => import('remote/Plain'),
      loading,
    }),
  ],
  [
    'noSSR / plain',
    createReactRemote({ id: 'remote/Plain', noSSR: true, loading }),
  ],
  [
    'noSSR / data',
    createReactRemote({ id: 'remote/DataCSR', noSSR: true, loading }),
  ],
] as const;
export default function Page() {
  const [revision, setRevision] = useState(0);
  const [key, setKey] = useState(0);
  const [visible, setVisible] = useState(true);
  return (
    <main>
      <h1>Unified React remote</h1>
      <p>
        Mode: {process.env.DEMO_MODE || 'manifest'} · parent render {revision}
      </p>
      <p>
        Applications mount in the browser. The first two component rows must be
        present in the raw server HTML.
      </p>
      <div className="controls">
        <button onClick={() => setRevision((n) => n + 1)}>
          Rerender parent
        </button>
        <button onClick={() => setKey((n) => n + 1)}>Remount remotes</button>
        <button onClick={() => setVisible((v) => !v)}>Toggle remotes</button>
      </div>
      {visible &&
        cases.map(([title, Remote], index) => (
          <div className="case" key={`${key}-${index}`} data-case={index}>
            <h2>{title}</h2>
            <Remote label={title} />
          </div>
        ))}
    </main>
  );
}
