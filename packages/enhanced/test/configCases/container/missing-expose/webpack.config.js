const { ContainerPlugin } = require('../../../../dist/src');

module.exports = {
  optimization: { emitOnErrors: true },
  plugins: [
    new ContainerPlugin({
      name: 'container',
      filename: 'container-file.js',
      library: {
        type: 'commonjs-module',
      },
      exposes: {
        './Missing': {
          import: ['./test', './does-not-exist.js'],
        },
        './test': './test',
      },
    }),
  ],
};
