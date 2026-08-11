export const BRIDGE_SSR_DEV_HOST =
  process.env.BRIDGE_SSR_DEV_HOST ?? 'localhost';

export const bridgeSsrRemotePort = (framework: 'react' | 'vue') =>
  framework === 'react' ? 2301 : 2302;

export const bridgeSsrServerManifestPath = 'ssr/mf-manifest.json';

export const bridgeSsrHostUrl = (port: number) =>
  `http://${BRIDGE_SSR_DEV_HOST}:${port}`;
