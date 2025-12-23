/**
 * SSR Worker (app1)
 *
 * This worker renders RSC flight streams to HTML using react-dom/server.
 * It must run WITHOUT --conditions=react-server to access react-dom/server.
 */

'use strict';

const path = require('path');
const fs = require('fs');

function buildRegistryFromMFManifest(manifestPath) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const reg =
      manifest?.additionalData?.rsc?.clientComponents ||
      manifest?.rsc?.clientComponents ||
      null;
    if (!reg) return null;
    // Normalize: ensure request is set (ssrRequest preferred)
    const out = {};
    for (const [id, entry] of Object.entries(reg)) {
      const request = entry?.ssrRequest || entry?.request;
      if (!request) {
        throw new Error(
          `SSR manifest missing request for client module "${id}".`,
        );
      }
      out[id] = {
        ...entry,
        request,
      };
    }
    return out;
  } catch (_e) {
    return null;
  }
}

// Preload RSC registry for SSR resolver.
// The SSR build always emits mf-manifest.ssr.json with additionalData.rsc.clientComponents.
(() => {
  const baseDir = path.resolve(__dirname, '../build');
  const mfSsrManifestPath = path.join(baseDir, 'mf-manifest.ssr.json');

  if (!fs.existsSync(mfSsrManifestPath)) {
    throw new Error(
      `SSR worker missing mf-manifest.ssr.json in ${baseDir}. Run the SSR build before starting the server.`,
    );
  }

  const registry = buildRegistryFromMFManifest(mfSsrManifestPath);
  if (!registry) {
    throw new Error(
      'SSR worker could not build __RSC_SSR_REGISTRY__ from mf-manifest.ssr.json. Ensure manifest.additionalData.rsc.clientComponents is present.',
    );
  }

  globalThis.__RSC_SSR_REGISTRY__ = registry;
})();

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
        clientManifest,
      );
      process.stdout.write(html);
    } catch (error) {
      console.error('SSR Worker Error:', error);
      process.exit(1);
    }
  });
}

renderSSR();
