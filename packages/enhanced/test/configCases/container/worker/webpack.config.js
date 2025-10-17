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

// Test worker compilation with Module Federation using ESM output, since
// worker support relies on `new Worker(new URL(...))` which requires module output.

module.exports = {
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
};
