import {
  ModuleFederationPluginOptions,
  NextFederationPluginExtraOptions,
  NextFederationPluginOptions,
} from '@module-federation/utilities';

/**
 * Utility function to set the main and extra options.
 *
 * @param options - The NextFederationPluginOptions instance.
 * @returns An object containing the main options and extra options.
 *
 * @remarks
 * This function sets the main and extra options for NextFederationPlugin. It splits the options object into
 * the main options and extra options, and sets default values for any options that are not defined. The default
 * extra options are:
 * - automaticPageStitching: false
 * - enableImageLoaderFix: false
 * - enableUrlLoaderFix: false
 * - skipSharingNextInternals: false
 */
export function setOptions(options: NextFederationPluginOptions): {
  mainOptions: ModuleFederationPluginOptions;
  extraOptions: NextFederationPluginExtraOptions;
} {
  const { extraOptions, ...mainOpts } = options;

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
