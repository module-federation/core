/**
 * SSR Entry Point
 *
 * Client components are included in the SSR bundle by AutoIncludeClientComponentsPlugin,
 * so React can resolve client references from the Flight stream.
 */

import { Readable, PassThrough } from 'stream';
import { createFromNodeStream } from '@module-federation/react-server-dom-webpack/client.node';
import { renderToPipeableStream } from 'react-dom/server';

function addModuleMapEntry(moduleMap, clientId, exportName, ssrId) {
  if (typeof clientId !== 'string' || clientId.length === 0) return;
  if (typeof exportName !== 'string' || exportName.length === 0) return;
  if (typeof ssrId !== 'string' || ssrId.length === 0) return;

  const existing = moduleMap[clientId] || {};
  existing[exportName] = {
    id: ssrId,
    name: exportName,
    chunks: [],
  };
  moduleMap[clientId] = existing;
}

/**
 * Render an RSC flight stream (Buffer) to HTML.
 * Exposed so the SSR worker can delegate rendering entirely to the bundled code.
 */
export async function renderFlightToHTML(flightBuffer, clientManifest) {
  const moduleMap = {};
  const registry = globalThis.__RSC_SSR_REGISTRY__ || {};
  const manifestExportsById = new Map();

  for (const manifestEntry of Object.values(clientManifest || {})) {
    if (!manifestEntry || typeof manifestEntry !== 'object') continue;
    const clientId = manifestEntry.id;
    if (typeof clientId !== 'string' || clientId.length === 0) continue;

    const exportName =
      typeof manifestEntry.name === 'string' ? manifestEntry.name : null;
    if (exportName === null) {
      throw new Error(
        `SSR manifest missing export name for client module "${clientId}".`,
      );
    }
    if (!manifestExportsById.has(clientId)) {
      manifestExportsById.set(clientId, new Set());
    }
    manifestExportsById.get(clientId).add(exportName);
  }

  const moduleIds = new Set([
    ...Object.keys(registry),
    ...manifestExportsById.keys(),
  ]);

  for (const clientId of moduleIds) {
    const registryEntry = registry[clientId];
    if (!registryEntry || typeof registryEntry.request !== 'string') {
      if (manifestExportsById.has(clientId)) {
        throw new Error(
          `SSR registry missing entry for client module "${clientId}".`,
        );
      }
      continue;
    }
    const ssrId = registryEntry.request;
    const exportNames = new Set();

    if (Array.isArray(registryEntry.exports)) {
      for (const name of registryEntry.exports) {
        if (typeof name === 'string' && name.length > 0) {
          exportNames.add(name);
        }
      }
    }
    const manifestExports = manifestExportsById.get(clientId);
    if (manifestExports) {
      for (const name of manifestExports) {
        exportNames.add(name);
      }
    }
    if (exportNames.size === 0) {
      exportNames.add('default');
    }

    for (const exportName of exportNames) {
      addModuleMapEntry(moduleMap, clientId, exportName, ssrId);
    }
    addModuleMapEntry(moduleMap, clientId, '*', ssrId);
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
