// @ts-check

/**
 * @type {import('@nrwl/devkit').ModuleFederationConfig}
 **/
const moduleFederationConfig = {
  name: 'react-ts-host',
  remotes: [['react_ts_remote', 'http://localhost:3004/remoteEntry.js']],
  exposes: {
    './Component': './src/app/nx-welcome.tsx',
    './ab/c/Component': './src/app/App.tsx',
  },
};

module.exports = moduleFederationConfig;
