export = ModuleLibraryPlugin;
/**
 * Represents the module library plugin runtime component.
 * @typedef {ModuleLibraryPluginParsed} T
 * @extends {AbstractLibraryPlugin<ModuleLibraryPluginParsed>}
 */
declare class ModuleLibraryPlugin extends AbstractLibraryPlugin<ModuleLibraryPluginParsed> {
    /**
     * Creates an instance of ModuleLibraryPlugin.
     * @param {ModuleLibraryPluginOptions} options the plugin options
     */
    constructor(options: ModuleLibraryPluginOptions);
    /**
     * Reports every external the entry star-reexports whose request names a property
     * path, which `export *` has no way to reference.
     * @param {Module} module the library entry module
     * @param {Compilation} compilation the compilation
     * @returns {void}
     */
    _checkStarReexportedExternals(module: Module, compilation: Compilation): void;
    /**
     * Analyze unknown provided exports.
     * @param {Source} source source
     * @param {Module} module module
     * @param {ModuleGraph} moduleGraph moduleGraph
     * @param {RuntimeSpec} runtime chunk runtime
     * @param {CodeGenerationResults} codeGenerationResults the code generation results
     * @param {[string, string][]} exports exports
     * @param {Set<string>} alreadyRenderedExports already rendered exports
     * @returns {ConcatSource} source with null provided exports
     */
    _analyzeUnknownProvidedExports(source: Source, module: Module, moduleGraph: ModuleGraph, runtime: RuntimeSpec, codeGenerationResults: CodeGenerationResults, exports: [string, string][], alreadyRenderedExports: Set<string>): ConcatSource;
    /**
     * Renders the setters through which hot modules, an update included, write the
     * bindings the chunk's scope declares; a list per name, as several libraries may.
     * A module that ran before the chunk loaded hands over its value through its exports.
     * @param {ChunkLiveExports} live the chunk's live bindings
     * @param {RuntimeTemplate} runtimeTemplate the runtime template
     * @returns {string} the registrations
     */
    _renderLiveExportSetters({ setters, hasAsync }: ChunkLiveExports, runtimeTemplate: RuntimeTemplate): string;
}
declare namespace ModuleLibraryPlugin {
    export { LibraryContext, ModuleLibraryPluginOptions, ModuleLibraryPluginParsed, ChunkLiveExports, LiveExportCandidate, ModuleLocalExports, T };
}
import AbstractLibraryPlugin = require("./AbstractLibraryPlugin");
import type Module from "../module/Module";
import type Compilation from "../Compilation";
import type { Source } from "webpack-sources";
import type ModuleGraph from "../graph/ModuleGraph";
import type { RuntimeSpec } from "../util/runtime";
import type CodeGenerationResults from "../module/CodeGenerationResults";
import { ConcatSource } from "webpack-sources";
import type RuntimeTemplate from "../template/RuntimeTemplate";
/**
 * <T>
 */
type LibraryContext<T> = import("./AbstractLibraryPlugin").LibraryContext<T>;
/**
 * Defines the module library plugin options type used by this module.
 */
type ModuleLibraryPluginOptions = {
    type: LibraryType;
};
/**
 * Defines the module library plugin parsed type used by this module.
 */
type ModuleLibraryPluginParsed = {
    name: string;
    export?: LibraryExport | undefined;
};
type ChunkLiveExports = {
    /**
     * the names the chunk's scope declares
     */
    names: string[];
    /**
     * the name each live export binds to
     */
    exports: Map<{
        name: import("../graph/Dependency").ExportInfoName;
        _usedName: import("../graph/ExportsInfo").ExportInfoUsedName;
        _globalUsed: import("../graph/ExportsInfo").UsageStateType | undefined;
        _usedInRuntime: import("../graph/ExportsInfo").UsedInRuntime | undefined;
        _hasUseInRuntimeInfo: boolean;
        provided: import("../graph/ExportsInfo").ExportInfoProvided | undefined;
        terminalBinding: boolean;
        canMangleProvide: boolean | undefined;
        _inlinedValue: import("../optimize/InlineExports").InlinedValue | undefined;
        canMangleUse: boolean | undefined;
        _inlineFlags: number;
        exportsInfoOwned: boolean;
        exportsInfo: import("../graph/ExportsInfo") | undefined;
        _target: import("../graph/ExportsInfo").Target | undefined;
        _maxTarget: import("../graph/ExportsInfo").Target | undefined;
        get canInlineProvide(): import("../optimize/InlineExports").InlinedValue | undefined;
        set canInlineProvide(value: import("../optimize/InlineExports").InlinedValue | undefined);
        get canInlineUse(): boolean | undefined;
        set canInlineUse(value: boolean | undefined);
        get pureProvide(): boolean | undefined;
        set pureProvide(value: boolean | undefined);
        get canMangle(): boolean;
        canInline(): import("../optimize/InlineExports").InlinedValue | undefined;
        setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
        setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
        setHasProvideInfo(): void;
        _resetProvideInfo(): void;
        _resetUseInfo(): void;
        setHasUseInfo(): void;
        setUsedConditionally(condition: (condition: UsageStateType) => boolean, newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        unsetTarget(key: import("../graph/Dependency")): boolean;
        setTarget(key: import("../graph/Dependency"), connection: import("../graph/ModuleGraphConnection"), exportName?: (import("../graph/Dependency").ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
        getUsed(runtime: RuntimeSpec): UsageStateType;
        getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | InlinedUsedName | false;
        hasUsedName(): boolean;
        setUsedName(name: string | InlinedUsedName): void;
        getTerminalBinding(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
        isReexport(): boolean;
        _getMaxTarget(): import("../graph/ExportsInfo").Target;
        findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
        _findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
        getTarget(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
        hasCircularTarget(moduleGraph: ModuleGraph): boolean;
        _getTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): import("../graph/ExportsInfo").TargetItemWithConnection | unique symbol;
        moveTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => import("../graph/ModuleGraphConnection") | undefined) | undefined): TargetItemWithConnection | undefined;
        createNestedExportsInfo(): ExportsInfo;
        getNestedExportsInfo(): import("../graph/ExportsInfo");
        hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
        updateHash(hash: import("../util/Hash"), runtime: RuntimeSpec): void;
        _updateHash(hash: import("../util/Hash"), runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
        getUsedInfo(): string;
        getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
        getRenameInfo(): string;
    }, string>;
    /**
     * the module id, local name, declared name, used export name and async status of each binding a module writes through a setter
     */
    setters: [string, string, string, string | false, boolean][];
    /**
     * whether any setter belongs to an async module
     */
    hasAsync: boolean;
};
type LiveExportCandidate = {
    /**
     * the module declaring the binding
     */
    module: Module;
    /**
     * its declaration
     */
    declaration: ESMLiveExportDependency;
    /**
     * the library's export of it
     */
    exportInfo: {
        name: import("../graph/Dependency").ExportInfoName;
        _usedName: import("../graph/ExportsInfo").ExportInfoUsedName;
        _globalUsed: import("../graph/ExportsInfo").UsageStateType | undefined;
        _usedInRuntime: import("../graph/ExportsInfo").UsedInRuntime | undefined;
        _hasUseInRuntimeInfo: boolean;
        provided: import("../graph/ExportsInfo").ExportInfoProvided | undefined;
        terminalBinding: boolean;
        canMangleProvide: boolean | undefined;
        _inlinedValue: import("../optimize/InlineExports").InlinedValue | undefined;
        canMangleUse: boolean | undefined;
        _inlineFlags: number;
        exportsInfoOwned: boolean;
        exportsInfo: import("../graph/ExportsInfo") | undefined;
        _target: import("../graph/ExportsInfo").Target | undefined;
        _maxTarget: import("../graph/ExportsInfo").Target | undefined;
        get canInlineProvide(): import("../optimize/InlineExports").InlinedValue | undefined;
        set canInlineProvide(value: import("../optimize/InlineExports").InlinedValue | undefined);
        get canInlineUse(): boolean | undefined;
        set canInlineUse(value: boolean | undefined);
        get pureProvide(): boolean | undefined;
        set pureProvide(value: boolean | undefined);
        get canMangle(): boolean;
        canInline(): import("../optimize/InlineExports").InlinedValue | undefined;
        setUsedInUnknownWay(runtime: RuntimeSpec): boolean;
        setUsedWithoutInfo(runtime: RuntimeSpec): boolean;
        setHasProvideInfo(): void;
        _resetProvideInfo(): void;
        _resetUseInfo(): void;
        setHasUseInfo(): void;
        setUsedConditionally(condition: (condition: UsageStateType) => boolean, newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        setUsed(newValue: UsageStateType, runtime: RuntimeSpec): boolean;
        unsetTarget(key: import("../graph/Dependency")): boolean;
        setTarget(key: import("../graph/Dependency"), connection: import("../graph/ModuleGraphConnection"), exportName?: (import("../graph/Dependency").ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
        getUsed(runtime: RuntimeSpec): UsageStateType;
        getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | InlinedUsedName | false;
        hasUsedName(): boolean;
        setUsedName(name: string | InlinedUsedName): void;
        getTerminalBinding(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
        isReexport(): boolean;
        _getMaxTarget(): import("../graph/ExportsInfo").Target;
        findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
        _findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
        getTarget(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
        hasCircularTarget(moduleGraph: ModuleGraph): boolean;
        _getTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): import("../graph/ExportsInfo").TargetItemWithConnection | unique symbol;
        moveTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => import("../graph/ModuleGraphConnection") | undefined) | undefined): TargetItemWithConnection | undefined;
        createNestedExportsInfo(): ExportsInfo;
        getNestedExportsInfo(): import("../graph/ExportsInfo");
        hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
        updateHash(hash: import("../util/Hash"), runtime: RuntimeSpec): void;
        _updateHash(hash: import("../util/Hash"), runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
        getUsedInfo(): string;
        getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
        getRenameInfo(): string;
    };
    /**
     * the local name the export binds to
     */
    localName: string;
    /**
     * whether the module keeps its declaration and mirrors each write
     */
    mirrored: boolean;
};
type ModuleLocalExports = {
    /**
     * each local export by its name
     */
    specifiers: Map<string, ESMExportSpecifierDependency>;
    /**
     * each live `let` by a name it declares
     */
    declarations: Map<string, ESMLiveExportDependency>;
};
/**
 * Represents the module library plugin runtime component.
 */
type T = ModuleLibraryPluginParsed;
import type { LibraryType } from "../../declarations/WebpackOptions";
import type { LibraryExport } from "../../declarations/WebpackOptions";
import type { InlinedUsedName } from "../optimize/InlineExports";
import ESMLiveExportDependency = require("../dependencies/esm/ESMLiveExportDependency");
import type ESMExportSpecifierDependency from "../dependencies/esm/ESMExportSpecifierDependency";
