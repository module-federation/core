import React, { Suspense, lazy } from 'react';

export const WebpackSvgRemote = function () {
  const WebpackSvgRemote = lazy(() => import('remote1/WebpackSvg'));
  return (
    <Suspense fallback="loading WebpackSvgRemote">
      <WebpackSvgRemote />
    </Suspense>
  );
};

export const WebpackPngRemote = function () {
  const WebpackPngRemote = lazy(() => import('remote1/WebpackPng'));
  return (
    <Suspense fallback="loading WebpackPngRemote">
      <WebpackPngRemote />
    </Suspense>
  );
};

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
