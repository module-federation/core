const path = require('path');
const moduleFederationConfig = {
  name: 'runtime_demo_host',
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
