export = ConcatenationScope;
/**
 * Encodes how a concatenated module reference should be interpreted when it is
 * later reconstructed from its placeholder identifier.
 * @typedef {object} ModuleReferenceOptions
 * @property {Ids} ids the properties or exports selected from the referenced module
 * @property {boolean} call true, when this referenced export is called
 * @property {boolean} directImport true, when this referenced export is directly imported (not via property access)
 * @property {boolean} deferredImport true, when this referenced export is deferred
 * @property {boolean} mangleableNamespace true, when a whole-namespace reference may use a decoupled namespace object that keeps the original export names
 * @property {boolean} moduleExportsAccess true, when the reference resolves to the module's own exports value with plain property access, skipping ESM interop (how `require()` and a wrapped module's side-effect init see it)
 * @property {boolean | undefined} asiSafe if the position is ASI safe or unknown
 */
/**
 * Tracks the symbols and cross-module references needed while rendering a
 * concatenated module.
 */
declare class ConcatenationScope {
    /**
     * Checks whether an identifier is one of webpack's encoded concatenation
     * module references.
     * @param {string} name the identifier
     * @returns {boolean} true, when it's an module reference
     */
    static isModuleReference(name: string): boolean;
    /**
     * Checks whether an identifier buries a reference token without being one,
     * which nothing can resolve: it would reach the output as an undeclared global.
     * @param {string} name the identifier
     * @returns {boolean} true, when a reference token is buried in the identifier
     */
    static isLeakedModuleReference(name: string): boolean;
    /**
     * Finds all encoded module references in a generated source. A match that
     * continues an identifier is reported as `leaked`: it is a token a wider
     * replacement swallowed, so substituting it would rewrite the middle of a name.
     * @param {Source} source generated source
     * @returns {ModuleReferenceMatch[]} reference token positions (end is exclusive, excludes the appended "._")
     */
    static findModuleReferences(source: Source): ModuleReferenceMatch[];
    /**
     * Parses an encoded module reference back into its module index and
     * reference flags.
     * @param {string} name the identifier
     * @returns {ModuleReferenceOptions & { index: number } | null} parsed options and index
     */
    static matchModuleReference(name: string): (ModuleReferenceOptions & {
        index: number;
    }) | null;
    /**
     * Creates the mutable scope object used while rendering a concatenated
     * module and its cross-module references.
     * @param {ModuleInfo[] | Map<Module, ModuleInfo>} modulesMap all module info by module
     * @param {ConcatenatedModuleInfo} currentModule the current module info
     * @param {Set<string>} usedNames all used names
     */
    constructor(modulesMap: ModuleInfo[] | Map<Module, ModuleInfo>, currentModule: ConcatenatedModuleInfo, usedNames: Set<string>);
    /** @type {ConcatenatedModuleInfo} */
    _currentModule: ConcatenatedModuleInfo;
    /** @type {Set<string>} */
    usedNames: Set<string>;
    /** @type {Map<Module, ModuleInfo>} */
    _modulesMap: Map<Module, ModuleInfo>;
    /**
     * Checks whether a module participates in the current concatenation scope.
     * @param {Module} module the referenced module
     * @returns {boolean} true, when it's in the scope
     */
    isModuleInScope(module: Module): boolean;
    /**
     * Whether an in-scope module's body renders inside the lazy wrapper.
     * @param {Module} module the referenced module
     * @returns {boolean} true, when it's wrapped
     */
    isModuleWrapped(module: Module): boolean;
    /**
     * Marks a wrapped module as eagerly imported, so its accessor is called at its
     * own slot in evaluation order instead of from inside the importing body.
     * @param {Module} module the referenced module
     */
    registerEagerModule(module: Module): void;
    /**
     * Whether the current module runs inside the lazy wrapper. Exports then live
     * on a real exports object, not hoisted bindings, so templates emit runtime
     * code.
     * @returns {boolean} true, when the current module is wrapped
     */
    isWrapped(): boolean;
    /**
     * Records the symbol that should be used when the current module exports a
     * named binding.
     * @param {string} exportName name of the export
     * @param {string} symbol identifier of the export in source code
     */
    registerExport(exportName: string, symbol: string): void;
    /**
     * Records a raw expression that can be used to reference an export without
     * going through the normal symbol map.
     * @param {string} exportName name of the export
     * @param {string} expression expression to be used
     */
    registerRawExport(exportName: string, expression: string): void;
    /**
     * Returns the raw expression registered for an export, if one exists.
     * @param {string} exportName name of the export
     * @returns {string | undefined} the expression of the export
     */
    getRawExport(exportName: string): string | undefined;
    /**
     * Replaces the raw expression for an export only when that export already
     * has an entry in the raw export map.
     * @param {string} exportName name of the export
     * @param {string} expression expression to be used
     */
    setRawExportMap(exportName: string, expression: string): void;
    /**
     * Records the symbol that should be used for the synthetic namespace export.
     * @param {string} symbol identifier of the export in source code
     */
    registerNamespaceExport(symbol: string): void;
    /**
     * Encodes a reference to another concatenated module as a placeholder
     * identifier that can be parsed later during code generation.
     * @param {Module} module the referenced module
     * @param {Partial<ModuleReferenceOptions>} options options
     * @returns {string} the reference as identifier
     */
    createModuleReference(module: Module, { ids, call, directImport, deferredImport, mangleableNamespace, moduleExportsAccess, asiSafe }: Partial<ModuleReferenceOptions>): string;
}
declare namespace ConcatenationScope {
    export { DEFAULT_EXPORT, NAMESPACE_OBJECT_EXPORT, ModuleReferenceMatch, ModuleReferenceOptions };
}
import type { ConcatenatedModuleInfo } from "./ConcatenatedModule";
import type Module from "../module/Module";
import type { ModuleInfo } from "./ConcatenatedModule";
import type { Source } from "webpack-sources";
import { DEFAULT_EXPORT } from "../util/concatenate";
import { NAMESPACE_OBJECT_EXPORT } from "../util/concatenate";
type ModuleReferenceMatch = {
    start: number;
    end: number;
    name: string;
    leaked: boolean;
};
/**
 * Encodes how a concatenated module reference should be interpreted when it is
 * later reconstructed from its placeholder identifier.
 */
type ModuleReferenceOptions = {
    /**
     * the properties or exports selected from the referenced module
     */
    ids: Ids;
    /**
     * true, when this referenced export is called
     */
    call: boolean;
    /**
     * true, when this referenced export is directly imported (not via property access)
     */
    directImport: boolean;
    /**
     * true, when this referenced export is deferred
     */
    deferredImport: boolean;
    /**
     * true, when a whole-namespace reference may use a decoupled namespace object that keeps the original export names
     */
    mangleableNamespace: boolean;
    /**
     * true, when the reference resolves to the module's own exports value with plain property access, skipping ESM interop (how `require()` and a wrapped module's side-effect init see it)
     */
    moduleExportsAccess: boolean;
    /**
     * if the position is ASI safe or unknown
     */
    asiSafe: boolean | undefined;
};
import type { ExportName as Ids } from "./ConcatenatedModule";
