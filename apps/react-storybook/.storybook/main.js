const nxModuleFederationConfig = require('../module-federation.config');

module.exports = {
  core: { builder: 'webpack5' },
  stories: [
    '../src/app/**/*.stories.mdx',
    '../src/app/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@nrwl/react/plugins/storybook',
    {
      name: '@module-federation/storybook-addon',
      options: {
        nxMfConfig: { ...nxModuleFederationConfig },
      },
    },
  ],
};

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs
