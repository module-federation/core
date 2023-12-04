// @ts-check

const moduleFederationConfig = {
  name: 'react_ts_remote',
  exposes: {
    './Module': './src/app/nx-welcome.tsx',
  },
};

module.exports = moduleFederationConfig;
