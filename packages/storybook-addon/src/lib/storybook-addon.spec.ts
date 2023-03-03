import { webpack } from './storybook-addon';
import { Configuration, container } from 'webpack';

const { ModuleFederationPlugin } = container;

const webpackConfig: Configuration = {
  mode: 'production',
  entry: './foo.js',
  output: {
    path: './dist',
    filename: 'foo.bundle.js',
  },
};

const moduleFederationConfig = {
  name: 'host',
  remotes: {
    remote: 'remote@http://localhost:3002/remoteEntry.js',
  },
  shared: {},
};

describe('webpack()', () => {
  it('should return error for webpack 4 version', async () => {
    const apply = jest.fn().mockResolvedValue(Promise.resolve('4'));

    const presets = {
      apply,
    };

    await expect(
      webpack(webpackConfig, {
        moduleFederationConfig,
        presets,
      })
    ).rejects.toThrow(
      'Webpack 5 required: Configure Storybook to use the webpack5 builder'
    );
  });

  it('should return config for webpack 5 version', async () => {
    const apply = jest.fn().mockResolvedValue(Promise.resolve('5'));

    const presets = {
      apply,
    };

    const matchObject = {
      ...webpackConfig,
      plugins: [new ModuleFederationPlugin(moduleFederationConfig)],
    };

    await expect(
      webpack(webpackConfig, {
        moduleFederationConfig,
        presets,
      })
    ).resolves.toMatchObject(matchObject);
  });
});
