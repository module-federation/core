import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { StorybookConfig } from 'storybook-react-rsbuild';

const require = createRequire(import.meta.url);

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
      name: getAbsolutePath('storybook-addon-rslib'),
      options: {
        rslib: {
          include: ['**/stories/**'],
        },
      },
    },
    {
      name: getAbsolutePath('@module-federation/storybook-addon/preset'),
      options: {
        remotes: {
          'rslib-module':
            'rslib_provider@http://localhost:3001/mf-manifest.json',
        },
      },
    },
  ],
};

export default config;
