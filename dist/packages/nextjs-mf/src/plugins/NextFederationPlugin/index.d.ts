import type { ModuleFederationPluginOptions, NextFederationPluginExtraOptions, NextFederationPluginOptions } from '@module-federation/utilities';
import type { Compiler } from 'webpack';
/**
 * NextFederationPlugin is a webpack plugin that handles Next.js application
 * federation using Module Federation.
 */
export declare class NextFederationPlugin {
    _options: ModuleFederationPluginOptions;
    _extraOptions: NextFederationPluginExtraOptions;
    /**
     * Constructs the NextFederationPlugin with the provided options.
     *
     * @param options The options to configure the plugin.
     */
    constructor(options: NextFederationPluginOptions);
    apply(compiler: Compiler): void;
}
export default NextFederationPlugin;
