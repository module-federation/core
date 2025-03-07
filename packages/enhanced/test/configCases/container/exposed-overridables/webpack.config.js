const { ModuleFederationPlugin } = require('../../../../dist/src');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'container',
      filename: 'container.js',
      exposes: {
        './Button': './Button',
      },
      experiments: { asyncStartup: false },
      shared: {
        react: {
          eager: true,
        },
      },
    }),
  ],
};
