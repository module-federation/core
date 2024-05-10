// shell\federation.config.js

const {
  withNativeFederation,
  shareAll,
} = require('@module-federation/esbuild/build');

module.exports = withNativeFederation({
  name: 'host',

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
      includeSecondaries: false,
    }),
  },
});
