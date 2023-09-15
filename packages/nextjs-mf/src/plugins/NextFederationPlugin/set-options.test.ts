import { setOptions } from './set-options';
import {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
} from '@module-federation/utilities';

describe('setOptions', () => {
  it('should set main and extra options with default values', () => {
    const options: NextFederationPluginOptions = {
      name: 'mockApp',
      library: { type: 'var', name: 'mockApp' },
      filename: 'remoteEntry.js',
      exposes: {},
      shared: {},
      extraOptions: {},
    };

    const { mainOptions, extraOptions } = setOptions(options);

    const expectedMainOptions: ModuleFederationPluginOptions = {
      ...mainOptions,
    };

    const expectedExtraOptions: NextFederationPluginExtraOptions = {
      automaticPageStitching: false,
      enableImageLoaderFix: false,
      enableUrlLoaderFix: false,
      skipSharingNextInternals: false,
      debug: false,
    };

    expect(mainOptions).toEqual(expectedMainOptions);
    expect(extraOptions).toEqual(expectedExtraOptions);
  });

  it('should set main and extra options with provided values', () => {
    const options: NextFederationPluginOptions = {
      name: 'mockApp',
      library: { type: 'var', name: 'mockApp' },
      filename: 'remoteEntry.js',
      exposes: {},
      shared: {},
      extraOptions: {
        automaticPageStitching: true,
        enableImageLoaderFix: true,
        enableUrlLoaderFix: true,
        skipSharingNextInternals: true,
      },
    };

    const { mainOptions, extraOptions } = setOptions(options);

    const expectedMainOptions: ModuleFederationPluginOptions = {
      name: 'mockApp',
      library: { type: 'var', name: 'mockApp' },
      filename: 'remoteEntry.js',
      exposes: {},
      shared: {},
    };

    const expectedExtraOptions: NextFederationPluginExtraOptions = {
      automaticPageStitching: true,
      enableImageLoaderFix: true,
      enableUrlLoaderFix: true,
      skipSharingNextInternals: true,
      debug: false,
    };

    expect(mainOptions).toEqual(expectedMainOptions);
    expect(extraOptions).toEqual(expectedExtraOptions);
  });
});
