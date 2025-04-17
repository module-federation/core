import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  output: {
    injectStyles: true,
  },
  source: {
    // Prevent pnpm workspace from causing dev dependencies on npm to take effect
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    port: 2004,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:2004',
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      delete config.optimization?.splitChunks;
    },
    // cssExtract: {
    // 	pluginOptions: {
    // 		insert(element) {
    // 			console.log('element22222233333333333333',document.querySelector("#remote2-style-component"));
    // 			document.querySelector("#remote2-style-component")?.appendChild(element);
    // 		},
    // 	}
    // },
    // styleLoader: {
    // 	insert: (element)=> {
    // 		debugger
    // 		const styleContainer = document.querySelector(".remote2_export-app") || document.head;
    // 		styleContainer.appendChild(element);
    // 		console.log('styleContainer', styleContainer)
    // 	},
    // },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'remote4',
      exposes: {
        './export-app': './src/export-App.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
});
