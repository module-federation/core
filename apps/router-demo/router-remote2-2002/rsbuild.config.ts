import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
// import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
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
      // 'react-router-dom$': require.resolve('@module-federation/bridge-react/dist/router-v6.es.js'),
      // 'react-router-dom\/$': path.resolve(
      //   __dirname,
      //   'node_modules/react-router-dom',
      // ),
    },
  },
  server: {
    port: 2002,
    host: 'localhost',
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:2002',
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      config.output!.uniqueName = 'remote2';
      delete config.optimization?.splitChunks;
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'remote2',
          exposes: {
            './button': './src/button.tsx',
            './export-app': './src/export-App.tsx',
          },
          shared: ['react', 'react-dom'],
        }),
      ]);
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
  plugins: [pluginReact()],
});
