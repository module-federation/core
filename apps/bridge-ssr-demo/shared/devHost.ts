export const BRIDGE_SSR_DEV_HOST =
  process.env.BRIDGE_SSR_DEV_HOST ?? 'localhost';

export const BRIDGE_SSR_REMOTE_BUNDLER =
  process.env.BRIDGE_SSR_REMOTE_BUNDLER === 'vite' ? 'vite' : 'rsbuild';

export const bridgeSsrRemotePort = (framework: 'react' | 'vue') => {
  if (BRIDGE_SSR_REMOTE_BUNDLER === 'vite') {
    return framework === 'react' ? 2401 : 2402;
  }
  return framework === 'react' ? 2301 : 2302;
};

export const bridgeSsrServerManifestPath = 'ssr/mf-manifest.json';

export const bridgeSsrHostUrl = (port: number) =>
  `http://${BRIDGE_SSR_DEV_HOST}:${port}`;
