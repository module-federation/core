// @ts-check

/**
 * @type {import('@nrwl/devkit').ModuleFederationConfig}
 **/
const moduleFederationConfig = {
  name: 'react_ts_host',
  remotes: [
    ['react_ts_remote', 'react_ts_remote@http://localhost:3004/remoteEntry.js'],
  ],
};

module.exports = moduleFederationConfig;
