import React, { useState } from 'react';
export default function Data({
  mfData,
  label,
}: {
  mfData?: { message: string; request: number; at: string };
  label?: string;
}) {
  const [clicks, setClicks] = useState(0);
  return (
    <article data-testid="data">
      <h3>SSR component with DataLoader</h3>
      <p>{label}</p>
      <p data-testid="data-value">
        {mfData
          ? `${mfData.message} | request ${mfData.request} | ${mfData.at}`
          : 'MISSING DATA'}
      </p>
      <button onClick={() => setClicks((n) => n + 1)}>
        Data clicks: {clicks}
      </button>
    </article>
  );
}
