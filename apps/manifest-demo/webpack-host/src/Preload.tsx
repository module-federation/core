import React, { Suspense, lazy, useEffect, useState } from 'react';
import { preloadRemote } from '@module-federation/runtime';

preloadRemote([
  {
    nameOrAlias: 'manifest-provider',
    resourceCategory: 'all',
  },
]);

const Preload: React.FC = () => {
  const [manifestTime, setManifestTime] = useState(0);
  const [pureEntryTime, setPureEntryTime] = useState(0);
  const [manifestRemote, setManifestRemote] = useState(null);
  const [jsEntryRemote, setPureEntryRemote] = useState(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // useEffect(() => {

  // }, [manifestRemote, jsEntryRemote]);

  const loadManifestProvider = () => {
    if (manifestRemote === null) {
      setLoadError(null);
      const manifestRemoteStartTime = Date.now();
      import('manifest-provider/Component')
        .then((m) => {
          const manifestRemoteEndTime = Date.now();
          setLoadError(null);
          setManifestTime(manifestRemoteEndTime - manifestRemoteStartTime);
          // @ts-ignore
          setManifestRemote({ default: m.default });
        })
        .catch((err) => {
          console.error('Failed to load manifest-provider/Component:', err);
          setLoadError(String(err));
        });
    }
  };

  const loadJSEntryProvider = () => {
    if (jsEntryRemote === null) {
      const pureEntryRemoteStartTime = Date.now();
      import('js-entry-provider/Component').then((m) => {
        const pureEntryRemoteEndTime = Date.now();
        console.log(
          'setPureEntryTime: ',
          pureEntryRemoteEndTime - pureEntryRemoteStartTime,
        );
        setPureEntryTime(pureEntryRemoteEndTime - pureEntryRemoteStartTime);
        // @ts-ignore
        setPureEntryRemote({ default: m.default });
      });
    }
  };
  // @ts-ignore
  const ManifestRemote = manifestRemote ? manifestRemote.default : null;
  // @ts-ignore
  const JSEntryRemote = jsEntryRemote ? jsEntryRemote.default : null;
  // @ts-ignore
  //  const PassResult = passResult ? passResult.default : null;
  return (
    <div>
      <h2>
        MF runtime can preload assets with <em>Manifest Provider</em>{' '}
      </h2>

      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <td></td>
            <td>Manifest Provider</td>
            <td>JS Entry Provider</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>click button to load remote component</td>
            <td>
              <button id="loadManifestProvider" onClick={loadManifestProvider}>
                load manifest provider
              </button>
            </td>
            <td>
              <button id="loadJSEntryProvider" onClick={loadJSEntryProvider}>
                load js entry provider
              </button>
            </td>
          </tr>
          <tr>
            <td>Component</td>
            <td>
              <Suspense fallback="loading ManifestRemote">
                {ManifestRemote && <ManifestRemote />}
                {loadError && (
                  <div id="manifest-load-error" style={{ color: 'red' }}>
                    {loadError}
                  </div>
                )}
              </Suspense>
            </td>
            <td>
              <Suspense fallback="loading JSEntryRemote">
                {JSEntryRemote && <JSEntryRemote />}
              </Suspense>
            </td>
          </tr>
          <tr>
            <td>time(ms)</td>
            <td>
              <div id="manifest-time" style={{ color: 'green' }}>
                {manifestTime}
              </div>
            </td>
            <td>
              <div id="js-entry-time" style={{ color: 'red' }}>
                {pureEntryTime}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Preload;
