// shell\federation.config.js

const {
  withNativeFederation,
  shareAll,
} = require('@module-federation/esbuild/build');

module.exports = withNativeFederation({
  name: 'host',
  filename: './shell/remoteEntry.js',
  remotes: {
    mfe1: 'http://localhost:3001/remoteEntry.js',
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
