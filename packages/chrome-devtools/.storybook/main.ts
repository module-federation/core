import type { StorybookConfig } from '@modern-js/storybook';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@chromatic-com/storybook'],

  framework: {
    name: '@modern-js/storybook',
    options: {
      bundler: 'webpack',
    },
  },

  docs: {
    autodocs: true,
  },
};

export default config;
