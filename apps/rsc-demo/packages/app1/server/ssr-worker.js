/**
 * SSR Worker (app1)
 *
 * This worker renders RSC flight streams to HTML using react-dom/server.
 * It must run WITHOUT --conditions=react-server to access react-dom/server.
 */

'use strict';

const {Readable} = require('stream');
const {renderToPipeableStream} = require('react-dom/server');
const {createFromNodeStream} = require('react-server-dom-webpack/client.node');

const ssrBundle = require('../build/ssr.js');
const clientManifest = require('../build/react-client-manifest.json');

function buildSSRManifest() {
  const moduleMap = {};

  for (const manifestEntry of Object.values(clientManifest)) {
    const moduleId = manifestEntry.id;
    moduleMap[moduleId] = {
      default: {id: moduleId, name: 'default', chunks: []},
      '*': {id: moduleId, name: '*', chunks: []},
      '': {id: moduleId, name: '', chunks: []},
    };
  }

  return {
    moduleLoading: {prefix: '', crossOrigin: null},
    moduleMap,
    serverModuleMap: null,
  };
}

function setupModuleLoader() {
  const {componentMap} = ssrBundle;

  if (typeof globalThis.__webpack_require__ === 'undefined') {
    globalThis.__webpack_chunk_load__ = () => Promise.resolve();
    globalThis.__webpack_require__ = function (moduleId) {
      const match = moduleId.match(/\(client\)\/(.+)/);
      const relativePath = match ? match[1] : moduleId;

      if (componentMap && componentMap[relativePath]) {
        const mod = componentMap[relativePath];
        if (!mod.__esModule) {
          mod.__esModule = true;
        }
        return mod;
      }

      const componentName = relativePath.split('/').pop().replace('.js', '');
      if (ssrBundle[componentName]) {
        return {__esModule: true, default: ssrBundle[componentName]};
      }

      console.warn(`SSR: Module not found: ${moduleId}`);
      return {
        default: function PlaceholderComponent() {
          return null;
        },
      };
    };

    globalThis.__webpack_require__.c = {};
  }
}

async function renderSSR() {
  setupModuleLoader();

  const chunks = [];

  process.stdin.on('data', (chunk) => {
    chunks.push(chunk);
  });

  process.stdin.on('end', async () => {
    try {
      const flightData = Buffer.concat(chunks);
      const flightStream = Readable.from([flightData]);
      const ssrManifest = buildSSRManifest();
      const tree = await createFromNodeStream(flightStream, ssrManifest);

      const {pipe} = renderToPipeableStream(tree, {
        onShellReady() {
          pipe(process.stdout);
        },
        onShellError(error) {
          console.error('SSR Shell Error:', error);
          process.exit(1);
        },
        onError(error) {
          console.error('SSR Error:', error);
        },
      });
    } catch (error) {
      console.error('SSR Worker Error:', error);
      process.exit(1);
    }
  });
}

renderSSR();
