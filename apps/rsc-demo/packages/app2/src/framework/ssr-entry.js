/**
 * SSR Entry Point
 *
 * This file imports all client components so they're available during SSR.
 * The webpack SSR bundle uses this to resolve client component references
 * from the RSC flight stream.
 *
 * Each client component is exported with a key matching its module path
 * so the SSR worker can resolve them by ID.
 */

// Client components from the app - import as default, re-export with path keys
import DemoCounterButton from '../DemoCounterButton';
import EditButton from '../EditButton';
import InlineActionButton from '../InlineActionButton';
import NoteEditor from '../NoteEditor';
import SearchField from '../SearchField';
import SidebarNoteContent from '../SidebarNoteContent';
import SharedClientWidget from '@rsc-demo/shared-rsc/src/SharedClientWidget';
import {Readable} from 'stream';
import {createFromNodeStream} from 'react-server-dom-webpack/client.node';
import {renderToPipeableStream} from 'react-dom/server';
import {installFederatedSSRResolver} from '../../../app-shared/framework/ssr-resolver';
import * as fs from 'fs';
import * as path from 'path';

// Framework client components
import * as Router from './router';

// Re-export all components so webpack includes them in the bundle.
export {
  DemoCounterButton,
  EditButton,
  InlineActionButton,
  NoteEditor,
  SearchField,
  SidebarNoteContent,
  SharedClientWidget,
  Router,
};

// Load RSC registry from client manifest at runtime
// The manifest is in the same build directory as this bundle
function loadRSCRegistry() {
  try {
    // __dirname in the bundle points to the build output directory
    const manifestPath = path.resolve(__dirname, 'mf-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return (
        manifest?.additionalData?.rsc?.clientComponents ||
        manifest?.rsc?.clientComponents ||
        {}
      );
    }
  } catch (_e) {
    // Ignore - resolver will use fallback
  }
  return {};
}

// Set registry globally before installing resolver
globalThis.__RSC_SSR_REGISTRY__ = loadRSCRegistry();

// Install federated resolver (uses globalThis.__RSC_SSR_REGISTRY__)
installFederatedSSRResolver();

export async function renderFlightToHTML(flightBuffer, clientManifest) {
  const moduleMap = {};

  for (const manifestEntry of Object.values(clientManifest)) {
    const clientId = manifestEntry.id;
    // Map (client) layer IDs to (ssr) layer IDs for the SSR bundle
    const ssrId = clientId.replace(/^\(client\)/, '(ssr)');
    moduleMap[clientId] = {
      default: {id: ssrId, name: 'default', chunks: []},
      '*': {id: ssrId, name: '*', chunks: []},
      '': {id: ssrId, name: '', chunks: []},
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
    const {pipe} = renderToPipeableStream(tree, {
      onShellReady() {
        const sink = {
          write(chunk) {
            // Ensure chunk is converted properly - Buffer or Uint8Array
            if (Buffer.isBuffer(chunk)) {
              html += chunk.toString('utf8');
            } else if (chunk instanceof Uint8Array) {
              html += Buffer.from(chunk).toString('utf8');
            } else {
              html += String(chunk);
            }
          },
          end() {
            resolve(html);
          },
        };
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
