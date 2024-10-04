const nxModuleFederationConfig = require('../module-federation.config');

module.exports = {
  stories: ['../src/app/**/*.mdx', '../src/app/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: [
    '@storybook/addon-essentials',
    '@nx/react/plugins/storybook',
    {
      name: '@module-federation/storybook-addon',
      options: {
        nxModuleFederationConfig: { ...nxModuleFederationConfig },
      },
    },
    '@chromatic-com/storybook',
  ],

  framework: {
    name: '@storybook/nextjs',
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
