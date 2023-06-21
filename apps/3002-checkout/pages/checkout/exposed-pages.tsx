import { useState, useEffect } from 'react';

import { loadAndInitializeRemote } from '@module-federation/utilities';

export default function ExposedPages() {
  const [pageMap, setPageMap] = useState('');
  const [pageMapV2, setPageMapV2] = useState('');

  useEffect(() => {
    loadAndInitializeRemote('checkout')
      .then((container) => container.get('./pages-map'))
      .then((data) => {
        setPageMap(data);
      });

    loadAndInitializeRemote('checkout')
      .then((container) => container.get('./pages-map-v2'))
      .then((data) => {
        setPageMapV2(data);
      });
  }, []);

  return (
    <>
      <h1>This app exposes the following pages:</h1>

      <h2>./pages-map</h2>
      <pre>{JSON.stringify(pageMap, undefined, 2)}</pre>

      <h2>./pages-map-v2</h2>
      <pre>{JSON.stringify(pageMapV2, undefined, 2)}</pre>
    </>
  );
}
