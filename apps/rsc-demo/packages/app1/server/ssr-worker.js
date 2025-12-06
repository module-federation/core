/**
 * SSR Worker (app1)
 *
 * This worker renders RSC flight streams to HTML using react-dom/server.
 * It must run WITHOUT --conditions=react-server to access react-dom/server.
 */

'use strict';

const path = require('path');
const fs = require('fs');

function buildRegistryFromSSRManifest(manifestPath) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const moduleMap = manifest?.moduleMap || {};
    const registry = {};
    for (const [moduleId, exportsMap] of Object.entries(moduleMap)) {
      const ssrRequest = moduleId.replace(/^\(client\)/, '(ssr)');
      registry[moduleId] = {
        moduleId,
        request: ssrRequest,
        ssrRequest,
        chunks: [],
        exports: Object.keys(exportsMap),
        filePath:
          (exportsMap['*'] || Object.values(exportsMap)[0])?.specifier?.replace(
            /^file:\/\//,
            ''
          ) || undefined,
      };
    }
    return Object.keys(registry).length ? registry : null;
  } catch (_e) {
    return null;
  }
}

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
      out[id] = {
        ...entry,
        request:
          entry.ssrRequest ||
          entry.request ||
          id.replace(/^\(client\)/, '(ssr)'),
      };
    }
    return out;
  } catch (_e) {
    return null;
  }
}

// Preload RSC registry for SSR resolver (prefer SSR manifest for correct ids)
(() => {
  const baseDir = path.resolve(__dirname, '../build');
  const mfSSR = path.join(baseDir, 'mf-manifest.ssr.json');
  const ssrManifest = path.join(baseDir, 'react-ssr-manifest.json');
  const mfClient = path.join(baseDir, 'mf-manifest.json');

  let registry = null;
  if (fs.existsSync(mfSSR)) registry = buildRegistryFromMFManifest(mfSSR);
  if (!registry && fs.existsSync(ssrManifest))
    registry = buildRegistryFromSSRManifest(ssrManifest);
  if (!registry && fs.existsSync(mfClient))
    registry = buildRegistryFromMFManifest(mfClient);

  if (registry) {
    globalThis.__RSC_SSR_REGISTRY__ = registry;
  }
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
