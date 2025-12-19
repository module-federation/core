'use client';

import React from 'react';

export default function HostBadge() {
  return (
    <div
      data-testid="app1-host-badge"
      style={{
        marginTop: 8,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid #93c5fd',
        background: '#eff6ff',
        color: '#1e40af',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      App1 HostBadge (federated)
    </div>
  );
}

