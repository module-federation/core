'use client';

import React, { useEffect, useState } from 'react';

export default function BidirectionalHostBadge() {
  const [RemoteBadge, setRemoteBadge] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
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
