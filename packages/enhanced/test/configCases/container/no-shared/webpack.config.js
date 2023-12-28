const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      filename: 'container.js',
      library: { type: 'commonjs-module' },
      exposes: ['./module'],
    }),
  ],
};
