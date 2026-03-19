import React, { Suspense, lazy } from 'react';

const WebpackSvg = lazy(() => import('shop/WebpackSvg'));

function TestWebpackSvgPage() {
  return (
    <Suspense fallback="loading WebpackSvg">
      <WebpackSvg />
    </Suspense>
  );
}

TestWebpackSvgPage.getInitialProps = async () => ({});

export default TestWebpackSvgPage;
