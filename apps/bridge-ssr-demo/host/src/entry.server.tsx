import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import {
  prepareSSRContext,
  type PrepareSSRContextOptions,
} from './lib/prepareSSRContext';

export { prepareSSRContext as getSSRContext };

function createHostTree(
  url: string,
  ssrContext: Awaited<ReturnType<typeof prepareSSRContext>>,
) {
  return (
    <StaticRouter location={url}>
      <App ssrContext={ssrContext} />
    </StaticRouter>
  );
}

/** String rendering remains available to focused tests and non-streaming consumers. */
export async function render(
  url: string,
  options: PrepareSSRContextOptions = {},
) {
  const ssrContext = await prepareSSRContext(url, options);
  return {
    html: renderToString(createHostTree(url, ssrContext)),
    ssrContext,
  };
}
