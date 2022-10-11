// @ts-check

/**
 * @type {import('@nrwl/react/module-federation').ModuleFederationConfig}
 **/
const moduleFederationConfig = {
  name: 'react-ts-host',
  // remotes: ['react-ts-remote'],
  exposes: {
    './Component': './src/app/nx-welcome.tsx',
  },
};

module.exports = moduleFederationConfig;
