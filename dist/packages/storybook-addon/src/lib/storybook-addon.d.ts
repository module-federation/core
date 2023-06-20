import { Configuration } from 'webpack';
import { ModuleFederationPluginOptions } from '@module-federation/utilities';
import type { ModuleFederationConfig } from '@nx/devkit';
import withModuleFederation from '../utils/with-module-federation';
export type Preset = string | {
    name: string;
};
type Options = {
    moduleFederationConfig?: ModuleFederationPluginOptions;
    nxModuleFederationConfig?: ModuleFederationConfig;
    presets: {
        apply<T>(preset: Preset): Promise<T>;
    };
    configDir: string;
};
export { withModuleFederation };
export declare const webpack: (webpackConfig: Configuration, options: Options) => Promise<Configuration>;
