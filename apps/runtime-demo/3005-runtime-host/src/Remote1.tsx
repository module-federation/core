import React, { Suspense, lazy } from 'react';
import { loadRemote } from '@module-federation/runtime';

export const WebpackSvgRemote = React.lazy(async () => {
  const WebpackSvgRemote = await loadRemote('remote1/WebpackSvg');
  return WebpackSvgRemote;
});

export const WebpackPngRemote = React.lazy(async () => {
  const WebpackPngRemote = await loadRemote('remote1/WebpackPng');
  return WebpackPngRemote;
});

function Remote1() {
  return (
    <div>
      <h2>WebpackSvgRemote</h2>
      <WebpackSvgRemote />
      <h2>WebpackPngRemote</h2>
      <WebpackPngRemote />
    </div>
  );
}

export default Remote1;
