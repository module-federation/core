/**
 * SSR Entry Point
 *
 * This file imports all client components so they're available during SSR.
 * The webpack SSR bundle uses this to resolve client component references
 * from the RSC flight stream.
 *
 * Components are imported but not re-exported - webpack includes them in the
 * bundle via the imports, and the SSR resolver looks them up by module ID.
 */

import {Readable, PassThrough} from 'stream';
import {createFromNodeStream} from 'react-server-dom-webpack/client.node';
import {renderToPipeableStream} from 'react-dom/server';
import {installFederatedSSRResolver} from '../../../app-shared/framework/ssr-resolver';

// Install federated resolver (uses globalThis.__RSC_SSR_REGISTRY__ or injected registry)
installFederatedSSRResolver();

function patchClientModules(registry) {
  const placeholder = function PlaceholderComponent() {
    return null;
  };
  if (!registry) return;
  for (const entry of Object.values(registry)) {
    const request = entry?.request || entry?.moduleId;
    if (!request) continue;
    try {
      const mod = __webpack_require__(request);
      if (mod && typeof mod.default === 'undefined') {
        mod.__esModule = true;
        mod.default = placeholder;
      }
    } catch (_e) {
      // best effort
    }
  }
}

/**
 * Render an RSC flight stream (Buffer) to HTML.
 * Exposed so the SSR worker can delegate rendering entirely to the bundled code.
 */
export async function renderFlightToHTML(flightBuffer, clientManifest) {
  const moduleMap = {};
  const registry = globalThis.__RSC_SSR_REGISTRY__ || {};

  // Ensure client component modules always have a callable default export.
  patchClientModules(registry);

  for (const manifestEntry of Object.values(clientManifest)) {
    const clientId = manifestEntry.id;
    const registryEntry = registry[clientId];
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
        console.error('SSR Error:', err);
      },
    });
  });
}
