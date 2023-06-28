import { useState, useEffect } from 'react';
import { loadAndInitializeRemote, getModule } from '@module-federation/core';

export default function ExposedPages() {
  const [pageMap, setPageMap] = useState('');
  const [pageMapV2, setPageMapV2] = useState('');

  useEffect(() => {
    loadAndInitializeRemote({
      global: 'home_app',
      url: 'http://localhost:3000/_next/static/chunks/remoteEntry.js',
    }).then((container) =>
      getModule<any>({
        remoteContainer: container,
        modulePath: './pages-map',
      }).then((data) => {
        setPageMap(data);
      })
    );

    loadAndInitializeRemote({
      global: 'home_app',
      url: 'http://localhost:3000/_next/static/chunks/remoteEntry.js',
    }).then((container) =>
      getModule<any>({
        remoteContainer: container,
        modulePath: './pages-map-v2',
      }).then((data) => {
        setPageMapV2(data);
      })
    );
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
