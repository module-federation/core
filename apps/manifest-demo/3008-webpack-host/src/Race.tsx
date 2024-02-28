import React, { Suspense, lazy, useEffect, useState } from 'react';

const Race: React.FC = () => {
  const [manifestTime, setManifestTime] = useState(0);
  const [pureEntryTime, setPureEntryTime] = useState(0);
  const [manifestRemote, setManifestRemote] = useState(null);
  const [pureEntryRemote, setPureEntryRemote] = useState(null);

  useEffect(() => {
    if (manifestRemote === null) {
      const manifestRemoteStartTime = Date.now();
      import('remote1/WebpackSvg').then((m) => {
        const manifestRemoteEndTime = Date.now();
        setManifestTime(manifestRemoteEndTime - manifestRemoteStartTime);
        // @ts-ignore
        setManifestRemote({ default: m.default });
      });
    }

    if (pureEntryRemote === null) {
      const pureEntryRemoteStartTime = Date.now();
      import('remote1/WebpackSvg').then((m) => {
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
  }, [manifestRemote, pureEntryRemote]);

  // @ts-ignore
  const ManifestRemote = manifestRemote ? manifestRemote.default : null;
  // @ts-ignore
  const PureEntryRemote = pureEntryRemote ? pureEntryRemote.default : null;
  // @ts-ignore
  //  const PassResult = passResult ? passResult.default : null;
  return (
    <div>
      <h1>Manifest vs PureEntry</h1>

      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <td></td>
            <td>Manifest Provider</td>
            <td>PureEntry Provider</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Component</td>
            <td>
              <Suspense fallback="loading WebpackSvgRemote">
                {ManifestRemote && <ManifestRemote />}
              </Suspense>
            </td>
            <td>
              <Suspense fallback="loading WebpackSvgRemote">
                {PureEntryRemote && <PureEntryRemote />}
              </Suspense>
            </td>
          </tr>
          <tr>
            <td>time</td>
            <td>{manifestTime}</td>
            <td>{pureEntryTime}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Race;
