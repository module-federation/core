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
    react: {
      singleton: true,
      version: '^18.2.0',
    },
    'react-dom': {
      singleton: true,
      version: '^18.2.0',
    },
    rxjs: {
      singleton: true,
      version: '^7.8.1',
    },
  },
});
