import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));

export function createBridgeRouterAlias(reactRouterDomPath: string) {
  return {
    'react-router-dom$': path.resolve(
      directory,
      '../../../packages/bridge/bridge-react/dist/router-v6.es.js',
    ),
    'react-router-dom/dist/index.js': reactRouterDomPath,
  };
}
