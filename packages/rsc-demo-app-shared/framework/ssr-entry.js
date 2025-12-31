/**
 * SSR Entry Point
 *
 * Client components are included in the SSR bundle by AutoIncludeClientComponentsPlugin,
 * so React can resolve client references from the Flight stream.
 */

import { Readable, PassThrough } from 'stream';
import { createFromNodeStream } from 'react-server-dom-webpack/client.node';
import { renderToPipeableStream } from 'react-dom/server';

/**
 * Render an RSC flight stream (Buffer) to HTML.
 * Exposed so the SSR worker can delegate rendering entirely to the bundled code.
 */
export async function renderFlightToHTML(flightBuffer, clientManifest) {
  const moduleMap = {};
  const registry = globalThis.__RSC_SSR_REGISTRY__ || {};

  for (const manifestEntry of Object.values(clientManifest)) {
    const clientId = manifestEntry.id;
    const registryEntry = registry[clientId];
    if (!registryEntry || typeof registryEntry.request !== 'string') {
      throw new Error(
        `SSR registry missing entry for client module "${clientId}".`,
      );
    }
    const ssrId = registryEntry.request;

    const exportName =
      typeof manifestEntry.name === 'string' ? manifestEntry.name : null;
    if (exportName === null) {
      throw new Error(
        `SSR manifest missing export name for client module "${clientId}".`,
      );
    }

    moduleMap[clientId] = {
      [exportName]: {
        id: ssrId,
        name: exportName,
        chunks: [],
      },
    };
  }

  const ssrManifest = {
    moduleLoading: { prefix: '', crossOrigin: null },
    moduleMap,
    serverModuleMap: null,
  };

  const flightStream = Readable.from([flightBuffer]);
  const tree = await createFromNodeStream(flightStream, ssrManifest);

  return new Promise((resolve, reject) => {
    let html = '';
    const sink = new PassThrough();
    sink.on('data', (chunk) => {
      html += chunk.toString('utf8');
    });
    sink.on('end', () => resolve(html));

    const { pipe } = renderToPipeableStream(tree, {
      onShellReady() {
        pipe(sink);
      },
      onShellError(err) {
        reject(err);
      },
      onError(err) {
        // Log but do not reject to allow HTML to stream
        console.error('SSR Error:', err);
      },
    });
  });
}
