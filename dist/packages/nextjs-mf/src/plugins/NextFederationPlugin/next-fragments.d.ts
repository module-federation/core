import type { Compiler } from 'webpack';
import { container } from 'webpack';
import type { ModuleFederationPluginOptions, SharedObject } from '@module-federation/utilities';
type ConstructableModuleFederationPlugin = new (options: ModuleFederationPluginOptions) => container.ModuleFederationPlugin;
/**
 * Gets the appropriate ModuleFederationPlugin based on the environment.
 * @param {boolean} isServer - A flag to indicate if the environment is server-side or not.
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @returns {ModuleFederationPlugin | undefined} The ModuleFederationPlugin or undefined if not applicable.
 */
export declare function getModuleFederationPluginConstructor(isServer: boolean, compiler: Compiler): ConstructableModuleFederationPlugin;
/**

 Set up default shared values based on the environment.
 @param isServer - Boolean indicating if the code is running on the server.
 @returns The default share scope based on the environment.
 */
export declare const retrieveDefaultShared: (isServer: boolean) => SharedObject;
/**

 Apply remote delegates.

 This function adds the remote delegates feature by configuring and injecting the appropriate loader that will look
 for internal delegate hoist or delegate hoist container and load it using a custom delegateLoader.
 Once loaded, it will then look for the available delegates that will be used to configure the remote
 that the hoisted module will be dependent upon.

 @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.

 @param {Compiler} compiler - The Webpack compiler instance.
 */
export declare function applyRemoteDelegates(options: ModuleFederationPluginOptions, compiler: Compiler): void;
export declare const applyPathFixes: (compiler: any, options: any) => void;
export {};
