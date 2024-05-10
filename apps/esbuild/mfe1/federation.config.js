const {
  withNativeFederation,
  shareAll,
} = require('@module-federation/esbuild/build');

module.exports = withNativeFederation({
  name: 'mfe1',

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

  // skip: [
  //   '@module-federation/native-federation'
  // ]
});
