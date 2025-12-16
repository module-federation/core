/**
 * SSR Entry Point
 *
 * Client components are included in the SSR bundle by AutoIncludeClientComponentsPlugin
 * (scripts/ssr.build.js), so React can resolve client references from the Flight stream.
 */

import {Readable, PassThrough} from 'stream';
import {createFromNodeStream} from 'react-server-dom-webpack/client.node';
import {renderToPipeableStream} from 'react-dom/server';

// Client components are pulled into the SSR bundle via AutoIncludeClientComponentsPlugin.

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
    // Prefer the registry-provided SSR request, fall back to simple prefix swap
    const ssrId =
      registryEntry?.request || clientId.replace(/^\(client\)/, '(ssr)');

    // Get the actual export name from the manifest (could be 'default' or a named export)
    const exportName = manifestEntry.name || 'default';

    // Build module map with both the actual export name and fallback entries
    moduleMap[clientId] = moduleMap[clientId] || {};
    moduleMap[clientId][exportName] = {id: ssrId, name: exportName, chunks: []};
    // Also add standard fallbacks for compatibility
    moduleMap[clientId]['default'] = moduleMap[clientId]['default'] || {
      id: ssrId,
      name: 'default',
      chunks: [],
    };
    moduleMap[clientId]['*'] = moduleMap[clientId]['*'] || {
      id: ssrId,
      name: '*',
      chunks: [],
    };
    moduleMap[clientId][''] = moduleMap[clientId][''] || {
      id: ssrId,
      name: '',
      chunks: [],
    };
  }

  const ssrManifest = {
    moduleLoading: {prefix: '', crossOrigin: null},
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

    const {pipe} = renderToPipeableStream(tree, {
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
