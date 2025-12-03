/**
 * SSR Worker (app1)
 *
 * This worker renders RSC flight streams to HTML using react-dom/server.
 * It must run WITHOUT --conditions=react-server to access react-dom/server.
 */

'use strict';

const ssrBundlePromise = Promise.resolve(require('../build/ssr.js'));
const clientManifest = require('../build/react-client-manifest.json');

async function renderSSR() {
  const chunks = [];

  process.stdin.on('data', (chunk) => {
    chunks.push(chunk);
  });

  process.stdin.on('end', async () => {
    try {
      const flightData = Buffer.concat(chunks);
      const ssrBundle = await ssrBundlePromise;
      const html = await ssrBundle.renderFlightToHTML(
        flightData,
        clientManifest
      );
      process.stdout.write(html);
    } catch (error) {
      console.error('SSR Worker Error:', error);
      process.exit(1);
    }
  });
}

renderSSR();
