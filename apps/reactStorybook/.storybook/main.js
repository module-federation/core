const { dirname, join } = require('node:path');

const nxModuleFederationConfig = require('../module-federation.config');

module.exports = {
  stories: ['../src/app/**/*.mdx', '../src/app/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: [
    getAbsolutePath('@nx/react/plugins/storybook'),
    {
      name: getAbsolutePath('@module-federation/storybook-addon'),
      options: {
        nxModuleFederationConfig: { ...nxModuleFederationConfig },
      },
    },
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-docs'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}
