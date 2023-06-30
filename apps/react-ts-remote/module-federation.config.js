// @ts-check

/**
 * @type {import('@nx/devkit').ModuleFederationConfig}
 **/
const moduleFederationConfig = {
  name: 'react-ts-remote',
  exposes: {
    './Module': './src/remote-entry.ts',
  },
};

module.exports = moduleFederationConfig;
