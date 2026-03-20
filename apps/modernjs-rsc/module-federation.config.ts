import { createModuleFederationConfig } from '@module-federation/modern-js-v3';

export default createModuleFederationConfig({
  name: 'modernjs_rsc',
  manifest: {
    filePath: 'static',
  },
  filename: 'static/remoteEntry.js',
  exposes: {
    './ServerMessage': './src/server/ServerMessage.tsx',
    './ClientCounter': './src/client/ClientCounter.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  experiments: {
    asyncStartup: true,
    rsc: true,
  },
});
