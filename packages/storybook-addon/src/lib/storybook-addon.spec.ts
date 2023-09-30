import { Preset, webpack } from './storybook-addon';
import { Configuration, container } from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';

const { ModuleFederationPlugin } = container;

const webpackConfig: Configuration = {
  mode: 'production',
  entry: './foo.js',
  output: {
    path: './dist',
    filename: 'foo.bundle.js',
  },
};

const configDir = '';

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
        configDir,
      }),
    ).rejects.toThrow(
      'Webpack 5 required: Configure Storybook to use the webpack5 builder',
    );
  });

  it('should return config for webpack 5 version', async () => {
    const apply = jest.fn().mockImplementation(async (preset: Preset) => {
      if (preset === 'webpackVersion') {
        return '5';
      }

      if (preset === 'entries') {
        return [webpackConfig.entry];
      }

      return undefined;
    });

    const presets = {
      apply,
    };

    const matchObject = {
      ...webpackConfig,
      entry: ['./__entry.js'],
      plugins: [
        new ModuleFederationPlugin(moduleFederationConfig),
        new VirtualModulesPlugin({
          './__entry.js': `import('./__bootstrap.js');`,
          './__bootstrap.js': `import '${webpackConfig.entry}';`,
        }),
      ],
    };

    await expect(
      webpack(webpackConfig, {
        moduleFederationConfig,
        presets,
        configDir,
      }),
    ).resolves.toMatchObject(matchObject);
  });
});
