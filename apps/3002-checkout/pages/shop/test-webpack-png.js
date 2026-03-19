import React, { Suspense, lazy } from 'react';

const WebpackPng = lazy(() => import('shop/WebpackPng'));

function TestWebpackPngPage() {
  return (
    <Suspense fallback="loading WebpackPng">
      <WebpackPng />
    </Suspense>
  );
}

TestWebpackPngPage.getInitialProps = async () => ({});

export default TestWebpackPngPage;
