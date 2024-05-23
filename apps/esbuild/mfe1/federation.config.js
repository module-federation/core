const {
  withFederation,
  shareAll,
} = require('@module-federation/esbuild/build');

module.exports = withFederation({
  name: 'mfe1',
  filename: './mfe1/remoteEntry.js',
  exposes: {
    './component': './mfe1/app',
  },
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
      includeSecondaries: false,
    }),
  },
});
