'use client';

import React, { useEffect, useState } from 'react';

export default function BidirectionalHostBadge() {
  const [RemoteBadge, setRemoteBadge] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Keep app2 runnable as a standalone notes app. The bidirectional federation
    // demo assumes the default MF demo ports (app2=4102, app1=4101).
    if (typeof window !== 'undefined' && window.location.port !== '4102') {
      return;
    }

    let canceled = false;

    import('app1/HostBadge')
      .then((mod) => {
        if (canceled) return;
        setRemoteBadge(() => mod.default);
      })
      .catch((err) => {
        if (canceled) return;
        setError(err);
      });

    return () => {
      canceled = true;
    };
  }, []);

  if (error) {
    throw error;
  }

  if (!RemoteBadge) {
    return null;
  }

  return (
    <div data-testid="bidirectional-host-badge">
      <RemoteBadge />
    </div>
  );
}
