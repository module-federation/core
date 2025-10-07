const { ModuleFederationPlugin } = require('../../../../dist/src');

const common = {
  name: 'container',
  exposes: {
    './ComponentA': {
      import: './ComponentA',
    },
  },
  shared: {
    react: {
      version: false,
      requiredVersion: false,
    },
  },
};

// Test worker compilation with Module Federation
// Workers require new Worker(new URL()) syntax per webpack docs
// We provide URL via moduleScope in test.config.js for Node targets

module.exports = [
  {
    output: {
      filename: '[name].js',
      uniqueName: 'worker-container',
    },
    target: 'async-node',
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'commonjs-module' },
        filename: 'container.js',
        remotes: {
          containerA: {
            external: './container.js',
          },
        },
        ...common,
      }),
    ],
  },
  {
    experiments: {
      outputModule: true,
    },
    output: {
      filename: 'module/[name].mjs',
      uniqueName: 'worker-container-mjs',
    },
    target: 'node14',
    plugins: [
      new ModuleFederationPlugin({
        library: { type: 'module' },
        filename: 'module/container.mjs',
        remotes: {
          containerA: {
            external: './container.mjs',
          },
        },
        ...common,
      }),
    ],
  },
];
