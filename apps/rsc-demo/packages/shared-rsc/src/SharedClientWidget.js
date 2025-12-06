'use client';

import React from 'react';

export default function SharedClientWidget({label = 'shared'}) {
  return <span data-testid="shared-client-widget">Shared: {label}</span>;
}
