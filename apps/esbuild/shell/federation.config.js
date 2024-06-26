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
