// @ts-check

/**
 * @type {import('@nrwl/devkit').ModuleFederationConfig}
 **/
const moduleFederationConfig = {
  name: 'react_ts_host',
  library: { type: 'var', name: 'react_ts_host' },
  remotes: [
    ['react_ts_remote', 'react_ts_remote@http://localhost:3004/remoteEntry.js'],
  ],
  exposes: {
    './Component': './src/app/nx-welcome.tsx',
    './ab/c/Component': './src/app/App.tsx',
  },
};

module.exports = moduleFederationConfig;
