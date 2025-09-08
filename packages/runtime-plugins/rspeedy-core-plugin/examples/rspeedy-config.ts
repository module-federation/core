/**
 * Example rspeedy configuration with Module Federation
 */

import { defineConfig } from '@lynx-js/rspeedy';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  entry: './src/index.tsx',
  
  plugins: [
    // Add Module Federation plugin for rspeedy
    pluginModuleFederation({
      name: 'lynx-host',
      remotes: {
        'lynx-remote': 'lynx-remote@http://localhost:3001/mf-manifest.json',
      },
      shared: ['react', 'react-dom'],
    }),
  ],

  // Additional rspeedy configuration
  dev: {
    port: 3000,
  },
  
  output: {
    distPath: './dist',
  },
  
  server: {
    port: 3000,
  },
});