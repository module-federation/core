import { initFederation } from '@module-federation/esbuild';

(async () => {
  await initFederation();
  await import('./bootstrap');
})();
