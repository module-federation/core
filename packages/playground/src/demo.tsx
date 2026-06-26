import React from 'react';

export default function PlaygroundDemo(props: { title?: string }) {
  return (
    <div
      style={{
        border: '1px solid rgba(99, 102, 241, 0.28)',
        borderRadius: 12,
        display: 'grid',
        gap: 8,
        padding: 16,
      }}
    >
      <strong>{props.title || 'Module Federation Playground'}</strong>
      <span>This remote was loaded from the public Playground demo.</span>
    </div>
  );
}
