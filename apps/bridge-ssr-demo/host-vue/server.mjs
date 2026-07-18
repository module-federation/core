import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startBridgeHost } from '../shared/createHostServer.mjs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
startBridgeHost({ rootDir, port: 2303, label: 'bridge-ssr-vue-host' }).catch(
  (error) => {
    console.error('[bridge-ssr-vue-host] failed:', error);
    process.exitCode = 1;
  },
);
