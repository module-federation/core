import { initFederation } from '@module-federation/native-federation';

(async () => {
  await initFederation();
  await import('./bootstrap');
})();
