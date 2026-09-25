const { ContainerPlugin } = require('../../../../dist/src');

module.exports = {
  plugins: [
    new ContainerPlugin({
      name: 'container',
      filename: 'container-file.js',
      library: {
        type: 'commonjs-module',
      },
      exposes: {
        './Missing': './does-not-exist.js',
        './test': './test',
      },
    }),
  ],
};
