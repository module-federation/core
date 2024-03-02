import { useState, useEffect } from 'react';
import { loadRemote } from '@module-federation/runtime';

import { injectScript } from '@module-federation/nextjs-mf/utils';

export default function ExposedPages() {
  const [pageMap, setPageMap] = useState('');
  const [pageMapV2, setPageMapV2] = useState('');

  useEffect(() => {
    loadRemote('checkout/pages-map').then((data) => {
      //@ts-ignore
      setPageMap(data);
    });

    loadRemote('checkout/pages-map-v2').then((data) => {
      //@ts-ignore
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
