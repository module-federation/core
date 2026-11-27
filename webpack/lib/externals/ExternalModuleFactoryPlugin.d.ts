export = ExternalModuleFactoryPlugin;
declare class ExternalModuleFactoryPlugin {
    /**
     * Creates an instance of ExternalModuleFactoryPlugin.
     * @param {ExternalsType | ((dependency: Dependency) => ExternalsType)} type default external type
     * @param {Externals} externals externals config
     */
    constructor(type: ExternalsType | ((dependency: Dependency) => ExternalsType), externals: Externals);
    type: ExternalsType | ((dependency: Dependency) => ExternalsType);
    /** @type {Externals} */
    externals: Externals;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {NormalModuleFactory} normalModuleFactory the normal module factory
     * @returns {void}
     */
    apply(normalModuleFactory: NormalModuleFactory): void;
}
declare namespace ExternalModuleFactoryPlugin {
    export { getAlternateCoreModuleRequest, ExternalItemFunctionDataGetResolveCallbackResult, ExternalItemFunctionDataGetResolveResult, ExternalItemFunctionDataGetResolve, ExternalItemFunctionData, ExternalItemFunctionCallback, ExternalItemFunctionPromise, ExternalItemByLayerFn, ExternalItemObject, ExternalWeakCache, ExternalTargetValue, ExternalValueWithOptions, ExternalValue };
}
import type { ExternalsType } from "../../declarations/WebpackOptions";
import type Dependency from "../graph/Dependency";
import type { Externals } from "../../declarations/WebpackOptions";
import type NormalModuleFactory from "../module/NormalModuleFactory";
/**
 * For a node.js core module request, returns its `node:`-prefixed/unprefixed
 * counterpart so externals match regardless of which form the code uses.
 * @param {string} request the request as written in the import/require
 * @returns {string | undefined} the alternate form, or undefined when not a core module
 */
declare function getAlternateCoreModuleRequest(request: string): string | undefined;
type ExternalItemFunctionDataGetResolveCallbackResult = ((context: string, request: string, callback: (err?: Error | null, result?: string | false, resolveRequest?: import("enhanced-resolve").ResolveRequest) => void) => void);
type ExternalItemFunctionDataGetResolveResult = ((context: string, request: string) => Promise<string>);
type ExternalItemFunctionDataGetResolve = (options?: ResolveOptions) => ExternalItemFunctionDataGetResolveCallbackResult | ExternalItemFunctionDataGetResolveResult;
/**
 * Defines the external item function data type used by this module.
 */
type ExternalItemFunctionData = {
    /**
     * the directory in which the request is placed
     */
    context: string;
    /**
     * contextual information
     */
    contextInfo: ModuleFactoryCreateDataContextInfo;
    /**
     * the category of the referencing dependency
     */
    dependencyType: string;
    /**
     * get a resolve function with the current resolver options
     */
    getResolve: ExternalItemFunctionDataGetResolve;
    /**
     * the request as written by the user in the require/import expression/statement
     */
    request: string;
    /**
     * same as `request`, except for an element of a context module (a request containing an expression), where it is the request as written by the user instead of the one relative to the resolved context directory
     */
    originalRequest: string;
};
type ExternalItemFunctionCallback = ((data: ExternalItemFunctionData, callback: (err?: (Error | null), result?: ExternalItemValue) => void) => void);
type ExternalItemFunctionPromise = ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>);
type ExternalItemByLayerFn = (layer: string | null) => ExternalItem;
type ExternalItemObject = ExternalItemObjectKnown & ExternalItemObjectUnknown;
/**
 * Defines the external weak cache type used by this module.
 */
type ExternalWeakCache<T extends ExternalItemObject> = WeakMap<T, Map<IssuerLayer, Omit<T, "byLayer">>>;
type ExternalTargetValue = string | string[] | boolean | Record<string, string | string[]>;
type ExternalValueWithOptions = {
    external: ExternalTargetValue;
    sideEffects?: boolean;
};
type ExternalValue = ExternalTargetValue | ExternalValueWithOptions;
import type { ResolveOptions } from "../../declarations/WebpackOptions";
import type { ModuleFactoryCreateDataContextInfo } from "../module/ModuleFactory";
import type { ExternalItemValue } from "../../declarations/WebpackOptions";
import type { ExternalItem } from "../../declarations/WebpackOptions";
import type { ExternalItemObjectKnown } from "../../declarations/WebpackOptions";
import type { ExternalItemObjectUnknown } from "../../declarations/WebpackOptions";
import type { IssuerLayer } from "../module/ModuleFactory";
