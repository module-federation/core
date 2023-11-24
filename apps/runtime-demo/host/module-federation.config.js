const path = require('path');
const moduleFederationConfig = {
  name: 'runtime_demo_host',
  remotes: {
    remote2: 'runtime_demo_remote2@http://localhost:3007/remoteEntry.js',
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: '>17',
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '>17',
    },
  },
  runtimePlugins: [path.join(__dirname, './runtimePlugin.ts')],
};

module.exports = moduleFederationConfig;
