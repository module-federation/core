import type { moduleFederationPlugin } from '@module-federation/sdk';
import type {
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
} from './next-fragments';

export function setOptions(options: NextFederationPluginOptions): {
  mainOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  extraOptions: NextFederationPluginExtraOptions;
} {
  const { extraOptions, ...mainOpts } = options;

  /**
   * Default extra options for NextFederationPlugin.
   * @type {NextFederationPluginExtraOptions}
   */
  const defaultExtraOptions: NextFederationPluginExtraOptions = {
    automaticPageStitching: false,
    enableImageLoaderFix: false,
    enableUrlLoaderFix: false,
    skipSharingNextInternals: false,
    debug: false,
  };

  return {
    mainOptions: mainOpts,
    extraOptions: { ...defaultExtraOptions, ...extraOptions },
  };
}
