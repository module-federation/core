import { dirname, join } from 'node:path';
import type { StorybookConfig } from 'storybook-react-rsbuild';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  framework: {
    name: getAbsolutePath('storybook-react-rsbuild'),
    options: {},
  },
  addons: [
    {
      name: '@module-federation/storybook-addon/preset',
      options: {
        remotes: {
          'rslib-module':
            'rslib-module@http://localhost:3000/mf/mf-manifest.json',
        },
        shareStrategy: 'loaded-first',
      },
    },
  ],
};

export default config;
