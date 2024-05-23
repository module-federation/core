// shell\federation.config.js

const {
  withFederation,
  shareAll,
} = require('@module-federation/esbuild/build');

module.exports = withFederation({
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
