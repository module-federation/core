import React from 'react';

export default function RemoteServerWidget() {
  return (
    <div
      data-testid="remote-server-widget"
      style={{
        marginTop: 8,
        padding: 8,
        border: '1px solid #f97316',
        borderRadius: 6,
        background: '#fff7ed',
        color: '#9a3412',
        fontSize: 12,
      }}
    >
      Remote server component rendered from app2 (RSC)
    </div>
  );
}
