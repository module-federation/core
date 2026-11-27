export = ModuleFactory;
/** @import { ResolveOptions } from "../../declarations/WebpackOptions" */
/** @import Dependency from "../graph/Dependency" */
/** @import Module from "./Module" */
/**
 * Defines the module factory result type used by this module.
 * @typedef {object} ModuleFactoryResult
 * @property {Module=} module the created module or unset if no module was created
 * @property {Set<string>=} fileDependencies
 * @property {Set<string>=} contextDependencies
 * @property {Set<string>=} missingDependencies
 * @property {boolean=} cacheable allow to use the unsafe cache
 */
/** @typedef {string | null} IssuerLayer */
/**
 * Defines the module factory create data context info type used by this module.
 * @typedef {object} ModuleFactoryCreateDataContextInfo
 * @property {string} issuer
 * @property {IssuerLayer} issuerLayer
 * @property {string=} compiler
 */
/**
 * Defines the module factory create data type used by this module.
 * @typedef {object} ModuleFactoryCreateData
 * @property {ModuleFactoryCreateDataContextInfo} contextInfo
 * @property {ResolveOptions=} resolveOptions
 * @property {string} context
 * @property {Dependency[]} dependencies
 */
/**
 * Represents the module factory runtime component.
 * @typedef {(err?: Error | null, result?: ModuleFactoryResult) => void} ModuleFactoryCallback
 */
declare class ModuleFactory {
    /**
     * Processes the provided data.
     * @abstract
     * @param {ModuleFactoryCreateData} data data object
     * @param {ModuleFactoryCallback} callback callback
     * @returns {void}
     */
    create(data: ModuleFactoryCreateData, callback: ModuleFactoryCallback): void;
}
declare namespace ModuleFactory {
    export { ModuleFactoryResult, IssuerLayer, ModuleFactoryCreateDataContextInfo, ModuleFactoryCreateData, ModuleFactoryCallback };
}
/**
 * Defines the module factory result type used by this module.
 */
type ModuleFactoryResult = {
    /**
     * the created module or unset if no module was created
     */
    module?: Module | undefined;
    fileDependencies?: Set<string> | undefined;
    contextDependencies?: Set<string> | undefined;
    missingDependencies?: Set<string> | undefined;
    /**
     * allow to use the unsafe cache
     */
    cacheable?: boolean | undefined;
};
type IssuerLayer = string | null;
/**
 * Defines the module factory create data context info type used by this module.
 */
type ModuleFactoryCreateDataContextInfo = {
    issuer: string;
    issuerLayer: IssuerLayer;
    compiler?: string | undefined;
};
/**
 * Defines the module factory create data type used by this module.
 */
type ModuleFactoryCreateData = {
    contextInfo: ModuleFactoryCreateDataContextInfo;
    resolveOptions?: ResolveOptions | undefined;
    context: string;
    dependencies: Dependency[];
};
/**
 * Represents the module factory runtime component.
 */
type ModuleFactoryCallback = (err?: Error | null, result?: ModuleFactoryResult) => void;
import type Module from "./Module";
import type { ResolveOptions } from "../../declarations/WebpackOptions";
import type Dependency from "../graph/Dependency";
