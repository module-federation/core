import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startBridgeHost } from '../shared/createHostServer.mjs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
startBridgeHost({ rootDir, port: 2300, label: 'bridge-ssr-react-host' }).catch(
  (error) => {
    console.error('[bridge-ssr-react-host] failed:', error);
    process.exitCode = 1;
  },
);
