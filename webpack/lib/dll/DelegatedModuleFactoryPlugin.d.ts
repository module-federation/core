export = DelegatedModuleFactoryPlugin;
declare class DelegatedModuleFactoryPlugin {
    /**
     * Creates an instance of DelegatedModuleFactoryPlugin.
     * @param {Options} options options
     */
    constructor(options: Options);
    /** @type {Options} */
    options: Options;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {NormalModuleFactory} normalModuleFactory the normal module factory
     * @returns {void}
     */
    apply(normalModuleFactory: NormalModuleFactory): void;
}
declare namespace DelegatedModuleFactoryPlugin {
    export { Options };
}
import type NormalModuleFactory from "../module/NormalModuleFactory";
/**
 * Defines the options type used by this module.
 */
type Options = {
    /**
     * source
     */
    source: DelegatedModule.DelegatedModuleSourceRequest;
    /**
     * absolute context path to which lib ident is relative to
     */
    context: NonNullable<DllReferencePluginOptions["context"]>;
    /**
     * content
     */
    content: DllReferencePluginOptionsContent;
    /**
     * type
     */
    type: DllReferencePluginOptions["type"];
    /**
     * extensions
     */
    extensions: DllReferencePluginOptions["extensions"];
    /**
     * scope
     */
    scope: DllReferencePluginOptions["scope"];
    /**
     * object for caching
     */
    associatedObjectForCache?: AssociatedObjectForCache | undefined;
};
import DelegatedModule = require("./DelegatedModule");
import type { DllReferencePluginOptions } from "./DllReferencePlugin";
import type { DllReferencePluginOptionsContent } from "./DllReferencePlugin";
import type { AssociatedObjectForCache } from "../util/identifier";
