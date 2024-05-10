//@ts-nocheck

import { initFederation } from '@module-federation/esbuild';

(async () => {
  await initFederation({
    mfe1: 'http://localhost:3001/remoteEntry.json',
  });

  await import('./bootstrap');
})();
