export = ConcatenationScope;
/**
 * @typedef {object} ModuleReferenceOptions
 * @property {Ids} ids the properties/exports of the module
 * @property {boolean} call true, when this referenced export is called
 * @property {boolean} directImport true, when this referenced export is directly imported (not via property access)
 * @property {boolean} deferredImport true, when this referenced export is deferred
 * @property {boolean | undefined} asiSafe if the position is ASI safe or unknown
 */
declare class ConcatenationScope {
    /**
     * @param {string} name the identifier
     * @returns {boolean} true, when it's an module reference
     */
    static isModuleReference(name: string): boolean;
    /**
     * @param {string} name the identifier
     * @returns {ModuleReferenceOptions & { index: number } | null} parsed options and index
     */
    static matchModuleReference(name: string): (ModuleReferenceOptions & {
        index: number;
    }) | null;
    /**
     * @param {ModuleInfo[] | Map<Module, ModuleInfo>} modulesMap all module info by module
     * @param {ConcatenatedModuleInfo} currentModule the current module info
     * @param {Set<string>} usedNames all used names
     */
    constructor(modulesMap: ModuleInfo[] | Map<Module, ModuleInfo>, currentModule: ConcatenatedModuleInfo, usedNames: Set<string>);
    _currentModule: import("./optimize/ConcatenatedModule").ConcatenatedModuleInfo;
    usedNames: Set<string>;
    _modulesMap: Map<import("./Module"), import("./optimize/ConcatenatedModule").ModuleInfo>;
    /**
     * @param {Module} module the referenced module
     * @returns {boolean} true, when it's in the scope
     */
    isModuleInScope(module: Module): boolean;
    /**
     * @param {string} exportName name of the export
     * @param {string} symbol identifier of the export in source code
     */
    registerExport(exportName: string, symbol: string): void;
    /**
     * @param {string} exportName name of the export
     * @param {string} expression expression to be used
     */
    registerRawExport(exportName: string, expression: string): void;
    /**
     * @param {string} exportName name of the export
     * @returns {string | undefined} the expression of the export
     */
    getRawExport(exportName: string): string | undefined;
    /**
     * @param {string} exportName name of the export
     * @param {string} expression expression to be used
     */
    setRawExportMap(exportName: string, expression: string): void;
    /**
     * @param {string} symbol identifier of the export in source code
     */
    registerNamespaceExport(symbol: string): void;
    /**
     * @param {Module} module the referenced module
     * @param {Partial<ModuleReferenceOptions>} options options
     * @returns {string} the reference as identifier
     */
    createModuleReference(module: Module, { ids, call, directImport, deferredImport, asiSafe }: Partial<ModuleReferenceOptions>): string;
}
declare namespace ConcatenationScope {
    export { DEFAULT_EXPORT, NAMESPACE_OBJECT_EXPORT, Chunk, Module, ConcatenatedModuleInfo, ModuleInfo, Ids, ModuleReferenceOptions };
}
import { DEFAULT_EXPORT } from "./util/concatenate";
import { NAMESPACE_OBJECT_EXPORT } from "./util/concatenate";
type Chunk = import("./Chunk");
type Module = import("./Module");
type ConcatenatedModuleInfo = import("./optimize/ConcatenatedModule").ConcatenatedModuleInfo;
type ModuleInfo = import("./optimize/ConcatenatedModule").ModuleInfo;
type Ids = import("./optimize/ConcatenatedModule").ExportName;
type ModuleReferenceOptions = {
    /**
     * the properties/exports of the module
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
     * if the position is ASI safe or unknown
     */
    asiSafe: boolean | undefined;
};
