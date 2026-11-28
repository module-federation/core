import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import path from 'node:path';

export default createModuleFederationConfig({
  name: 'federation_consumer',
  shareStrategy: 'loaded-first',
  remotes: {
    remote1: 'remote1@http://localhost:2001/mf-manifest.json',
    remote2: 'remote2@http://localhost:2002/mf-manifest.json',
    remote3: 'remote3@http://localhost:2003/mf-manifest.json',
    'remote-render-error':
      'remote-render-error@http://localhost:2004/mf-manifest.json',
    'remote-resource-error':
      'remote-resource-error@http://localhost:2008/not-exist-mf-manifest.json',
    remote5: 'remote5@http://localhost:2005/mf-manifest.json',
    remote6: 'remote6@http://localhost:2006/mf-manifest.json',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  runtimePlugins: [
    path.join(import.meta.dirname, 'src/runtime-plugin/shared-strategy.ts'),
    path.join(import.meta.dirname, 'src/runtime-plugin/retry.ts'),
    path.join(import.meta.dirname, 'src/runtime-plugin/fallback.ts'),
  ],
});
