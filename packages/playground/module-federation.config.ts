import { createModuleFederationConfig } from '@module-federation/rsbuild-plugin';
import pkg from './package.json';

const configuredPublicPath =
  process.env.PLAYGROUND_PUBLIC_PATH ||
  `https://unpkg.com/${pkg.name}@latest/dist/mf/`;
const productionPublicPath = configuredPublicPath.endsWith('/')
  ? configuredPublicPath
  : `${configuredPublicPath}/`;

export default createModuleFederationConfig({
  name: 'mf_playground',
  filename: 'remoteEntry.js',
  exposes: {
    '.': './src/component.ts',
    './demo': './src/demo.tsx',
  },
  shared: {
    react: {
      singleton: true,
    },
    'react/': {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
    'react-dom/': {
      singleton: true,
    },
  },
  dts: false,
  getPublicPath:
    process.env.NODE_ENV === 'production'
      ? `function() { return ${JSON.stringify(productionPublicPath)}; }`
      : undefined,
});
