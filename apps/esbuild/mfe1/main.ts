import { initFederation } from '@module-federation/esbuild';

(async () => {
  await initFederation(undefined, { name: 'mfe1' });
  await import('./bootstrap');
})();
