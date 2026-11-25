export = ModuleGraph;
/** @typedef {(moduleGraphConnection: ModuleGraphConnection) => boolean} FilterConnection */
/** @typedef {EXPECTED_OBJECT} MetaKey */
/**
 * @import {
 * 	idsSymbol as CommonJsExportRequireDependencyIDsSymbol
 * } from "../dependencies/commonjs/CommonJsExportRequireDependency"
 */
/**
 * @import {
 * 	idsSymbol as ESMExportImportedSpecifierDependencyIDsSymbol
 * } from "../dependencies/esm/ESMExportImportedSpecifierDependency"
 */
/**
 * A module-level `let` a module library declares in the chunk's scope instead.
 * @typedef {object} LiveBinding
 * @property {string} name the name the chunk's scope declares
 * @property {Set<string>} runtimes the keys of the runtimes declaring it
 * @property {Set<string>} registered the keys of the runtimes where a module mirrors it through the setters a module library registers, not by name
 */
/**
 * Defines the known meta type used by this module.
 * @typedef {object} KnownMeta
 * @property {Map<Module, string>=} importVarMap
 * @property {Map<Module, string>=} deferredImportVarMap
 * @property {boolean=} onDemandExports generate export definitions on demand
 * @property {Map<string, LiveBinding>=} liveBindings module-level `let` names a module library declares in the chunk's scope instead
 * @property {Map<string, LiveBinding>=} liveSetters module-level names a module keeps declared and mirrors to the chunk's scope on each write
 */
/** @typedef {KnownMeta & Record<CommonJsExportRequireDependencyIDsSymbol | ESMImportSpecifierDependencyIDsSymbol | ESMExportImportedSpecifierDependencyIDsSymbol, string[]> & Record<string, EXPECTED_ANY>} Meta */
declare class ModuleGraph {
    /**
     * Gets module graph for module.
     * @deprecated
     * @param {Module} module the module
     * @param {string} deprecateMessage message for the deprecation message
     * @param {string} deprecationCode code for the deprecation
     * @returns {ModuleGraph} the module graph
     */
    static getModuleGraphForModule(module: Module, deprecateMessage: string, deprecationCode: string): ModuleGraph;
    /**
     * Sets module graph for module.
     * @deprecated
     * @param {Module} module the module
     * @param {ModuleGraph} moduleGraph the module graph
     * @returns {void}
     */
    static setModuleGraphForModule(module: Module, moduleGraph: ModuleGraph): void;
    /**
     * Clear module graph for module.
     * @deprecated
     * @param {Module} module the module
     * @returns {void}
     */
    static clearModuleGraphForModule(module: Module): void;
    /**
     * @type {WeakMap<Dependency, ModuleGraphConnection | null>}
     * @private
     */
    private _dependencyMap;
    /**
     * @type {Map<Module, ModuleGraphModule>}
     * @private
     */
    private _moduleMap;
    /**
     * @type {WeakMap<MetaKey, Meta>}
     * @private
     */
    private _metaMap;
    /**
     * @type {WeakTupleMap<EXPECTED_ANY[], EXPECTED_ANY> | undefined}
     * @private
     */
    private _cache;
    /**
     * @type {ModuleMemCaches | undefined}
     * @private
     */
    private _moduleMemCaches;
    /**
     * @type {string | undefined}
     * @private
     */
    private _cacheStage;
    /**
     * @type {{ oldModule?: Module, newModule: Module, movedOut?: ModuleGraphConnection[] | undefined, movedIn?: ModuleGraphConnection[] | undefined, copied?: ModuleGraphConnection[] }[] | undefined}
     * @private
     */
    private _mutationJournal;
    /**
     * @type {WeakMap<Dependency, DependencySourceOrder>}
     * @private
     */
    private _dependencySourceOrderMap;
    /**
     * @type {Set<Module>}
     * @private
     */
    private _modulesNeedingSort;
    /**
     * Get module graph module.
     * @param {Module} module the module
     * @returns {ModuleGraphModule} the internal module
     */
    _getModuleGraphModule(module: Module): ModuleGraphModule;
    /**
     * Updates parents using the provided dependency.
     * @param {Dependency} dependency the dependency
     * @param {DependenciesBlock} block parent block
     * @param {Module} module parent module
     * @param {number=} indexInBlock position in block
     * @returns {void}
     */
    setParents(dependency: Dependency, block: DependenciesBlock, module: Module, indexInBlock?: number | undefined): void;
    /**
     * Sets parent dependencies block index.
     * @param {Dependency} dependency the dependency
     * @param {number} index the index
     * @returns {void}
     */
    setParentDependenciesBlockIndex(dependency: Dependency, index: number): void;
    /**
     * Gets parent module.
     * @param {Dependency} dependency the dependency
     * @returns {Module | undefined} parent module
     */
    getParentModule(dependency: Dependency): Module | undefined;
    /**
     * Returns parent block.
     * @param {Dependency} dependency the dependency
     * @returns {DependenciesBlock | undefined} parent block
     */
    getParentBlock(dependency: Dependency): DependenciesBlock | undefined;
    /**
     * Gets parent block index.
     * @param {Dependency} dependency the dependency
     * @returns {number} index
     */
    getParentBlockIndex(dependency: Dependency): number;
    /**
     * Sets resolved module.
     * @param {Module | null} originModule the referencing module
     * @param {Dependency} dependency the referencing dependency
     * @param {Module} module the referenced module
     * @returns {void}
     */
    setResolvedModule(originModule: Module | null, dependency: Dependency, module: Module): void;
    /**
     * Updates module using the provided dependency.
     * @param {Dependency} dependency the referencing dependency
     * @param {Module} module the referenced module
     * @returns {void}
     */
    updateModule(dependency: Dependency, module: Module): void;
    /**
     * Updates parent using the provided dependency.
     * @param {Dependency} dependency the need update dependency
     * @param {ModuleGraphConnection=} connection the target connection
     * @param {Module=} parentModule the parent module
     * @returns {void}
     */
    updateParent(dependency: Dependency, connection?: ModuleGraphConnection | undefined, parentModule?: Module | undefined): void;
    /**
     * Finish update parent.
     * @returns {void}
     */
    finishUpdateParent(): void;
    /**
     * Removes connection.
     * @param {Dependency} dependency the referencing dependency
     * @returns {void}
     */
    removeConnection(dependency: Dependency): void;
    /**
     * Removes every outgoing connection of `module` whose dependency is in
     * `staleDependencies`, including inactive ones left by `updateModule`
     * re-targeting (which the dependency-keyed `removeConnection` misses). Needed
     * when a module is rebuilt against a persisted graph so stale connections don't
     * linger in the old target's incoming set and crash seal-time plugins.
     * @param {Module} module the rebuilt origin module
     * @param {Set<Dependency>} staleDependencies dependencies replaced by the rebuild
     * @returns {void}
     */
    _removeStaleOutgoingConnections(module: Module, staleDependencies: Set<Dependency>): void;
    /**
     * Assigns `module`'s pending outgoing connections into the dependency map by
     * origin. `getConnection` normally does this lazily keyed by a dependency's
     * PARENT module; an incremental barrel un-lazy wires a re-export target from
     * the importer's walk, so the export dep's parent differs from its origin
     * barrel and the lazy flush never reaches it. Flush by origin to fix that.
     * @param {Module} module the origin module
     * @returns {void}
     */
    _flushUnassignedConnections(module: Module): void;
    /**
     * Adds the provided dependency to the module graph.
     * @param {Dependency} dependency the referencing dependency
     * @param {string} explanation an explanation
     * @returns {void}
     */
    addExplanation(dependency: Dependency, explanation: string): void;
    /**
     * Clones module attributes.
     * @param {Module} sourceModule the source module
     * @param {Module} targetModule the target module
     * @returns {void}
     */
    cloneModuleAttributes(sourceModule: Module, targetModule: Module): void;
    /**
     * Removes module attributes.
     * @param {Module} module the module
     * @returns {void}
     */
    removeModuleAttributes(module: Module): void;
    /**
     * Removes a module from the graph entirely, detaching its connections. Used to
     * drop stale runtime modules on an incremental rebuild so the persisted graph
     * doesn't accumulate them.
     * @param {Module} module the module to remove
     * @returns {void}
     */
    _removeModule(module: Module): void;
    /**
     * Removes all module attributes.
     * @returns {void}
     */
    removeAllModuleAttributes(): void;
    /**
     * Move module connections.
     * @param {Module} oldModule the old referencing module
     * @param {Module} newModule the new referencing module
     * @param {FilterConnection} filterConnection filter predicate for replacement
     * @returns {void}
     */
    moveModuleConnections(oldModule: Module, newModule: Module, filterConnection: FilterConnection): void;
    /**
     * Start recording connection moves so they can later be reversed for incremental rebuilds.
     * @returns {void}
     */
    _startMutationJournal(): void;
    /**
     * Reverse all recorded connection moves, restoring the graph to its pre-seal
     * (end-of-make) state, then stop recording (incremental rebuilds).
     * @returns {void}
     */
    _restoreFromMutationJournal(): void;
    /**
     * Copies outgoing module connections.
     * @param {Module} oldModule the old referencing module
     * @param {Module} newModule the new referencing module
     * @param {FilterConnection} filterConnection filter predicate for replacement
     * @returns {void}
     */
    copyOutgoingModuleConnections(oldModule: Module, newModule: Module, filterConnection: FilterConnection): void;
    /**
     * Adds the provided module to the module graph.
     * @param {Module} module the referenced module
     * @param {string} explanation an explanation why it's referenced
     * @returns {void}
     */
    addExtraReason(module: Module, explanation: string): void;
    /**
     * Gets resolved module.
     * @param {Dependency} dependency the dependency to look for a referenced module
     * @returns {Module | null} the referenced module
     */
    getResolvedModule(dependency: Dependency): Module | null;
    /**
     * Returns the connection.
     * @param {Dependency} dependency the dependency to look for a referenced module
     * @returns {ModuleGraphConnection | undefined} the connection
     */
    getConnection(dependency: Dependency): ModuleGraphConnection | undefined;
    /**
     * Returns the referenced module.
     * @param {Dependency} dependency the dependency to look for a referenced module
     * @returns {Module | null} the referenced module
     */
    getModule(dependency: Dependency): Module | null;
    /**
     * Returns the referencing module.
     * @param {Dependency} dependency the dependency to look for a referencing module
     * @returns {Module | null} the referencing module
     */
    getOrigin(dependency: Dependency): Module | null;
    /**
     * Gets resolved origin.
     * @param {Dependency} dependency the dependency to look for a referencing module
     * @returns {Module | null} the original referencing module
     */
    getResolvedOrigin(dependency: Dependency): Module | null;
    /**
     * Gets incoming connections.
     * @param {Module} module the module
     * @returns {Iterable<ModuleGraphConnection>} reasons why a module is included
     */
    getIncomingConnections(module: Module): Iterable<ModuleGraphConnection>;
    /**
     * Gets outgoing connections.
     * @param {Module} module the module
     * @returns {Iterable<ModuleGraphConnection>} list of outgoing connections
     */
    getOutgoingConnections(module: Module): Iterable<ModuleGraphConnection>;
    /**
     * Gets incoming connections by origin module.
     * @param {Module} module the module
     * @returns {ReadonlyMap<Module | undefined | null, ReadonlyArray<ModuleGraphConnection>>} reasons why a module is included, in a map by source module
     */
    getIncomingConnectionsByOriginModule(module: Module): ReadonlyMap<Module | undefined | null, ReadonlyArray<ModuleGraphConnection>>;
    /**
     * Gets outgoing connections by module.
     * @param {Module} module the module
     * @returns {ReadonlyMap<Module | undefined, ReadonlyArray<ModuleGraphConnection>> | undefined} connections to modules, in a map by module
     */
    getOutgoingConnectionsByModule(module: Module): ReadonlyMap<Module | undefined, ReadonlyArray<ModuleGraphConnection>> | undefined;
    /**
     * Returns the module profile.
     * @param {Module} module the module
     * @returns {ModuleProfile | undefined} the module profile
     */
    getProfile(module: Module): ModuleProfile | undefined;
    /**
     * Updates profile using the provided module.
     * @param {Module} module the module
     * @param {ModuleProfile | undefined} profile the module profile
     * @returns {void}
     */
    setProfile(module: Module, profile: ModuleProfile | undefined): void;
    /**
     * Returns the issuer module.
     * @param {Module} module the module
     * @returns {Issuer} the issuer module
     */
    getIssuer(module: Module): Issuer;
    /**
     * Updates issuer using the provided module.
     * @param {Module} module the module
     * @param {Module | null} issuer the issuer module
     * @returns {void}
     */
    setIssuer(module: Module, issuer: Module | null): void;
    /**
     * Sets issuer if unset.
     * @param {Module} module the module
     * @param {Module | null} issuer the issuer module
     * @returns {void}
     */
    setIssuerIfUnset(module: Module, issuer: Module | null): void;
    /**
     * Gets optimization bailout.
     * @param {Module} module the module
     * @returns {OptimizationBailouts} optimization bailouts
     */
    getOptimizationBailout(module: Module): OptimizationBailouts;
    /**
     * Gets provided exports.
     * @param {Module} module the module
     * @returns {null | true | ExportInfoName[]} the provided exports
     */
    getProvidedExports(module: Module): null | true | Dependency.ExportInfoName[];
    /**
     * Checks whether this module graph is export provided.
     * @param {Module} module the module
     * @param {ExportInfoName | ExportInfoName[]} exportName a name of an export
     * @returns {boolean | null} true, if the export is provided by the module.
     * null, if it's unknown.
     * false, if it's not provided.
     */
    isExportProvided(module: Module, exportName: Dependency.ExportInfoName | Dependency.ExportInfoName[]): boolean | null;
    /**
     * Returns info about the exports.
     * @param {Module} module the module
     * @returns {ExportsInfo} info about the exports
     */
    getExportsInfo(module: Module): ExportsInfo;
    /**
     * Returns info about the export.
     * @param {Module} module the module
     * @param {string} exportName the export
     * @returns {InstanceType<ExportInfo>} info about the export
     */
    getExportInfo(module: Module, exportName: string): {
        name: Dependency.ExportInfoName;
        _usedName: ExportsInfo.ExportInfoUsedName;
        _globalUsed: ExportsInfo.UsageStateType | undefined;
        _usedInRuntime: ExportsInfo.UsedInRuntime | undefined;
        _hasUseInRuntimeInfo: boolean;
        provided: ExportsInfo.ExportInfoProvided | undefined;
        terminalBinding: boolean;
        canMangleProvide: boolean | undefined;
        _inlinedValue: import("../optimize/InlineExports").InlinedValue | undefined;
        canMangleUse: boolean | undefined;
        _inlineFlags: number;
        exportsInfoOwned: boolean;
        exportsInfo: ExportsInfo | undefined;
        _target: ExportsInfo.Target | undefined;
        _maxTarget: ExportsInfo.Target | undefined;
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
        unsetTarget(key: Dependency): boolean;
        setTarget(key: Dependency, connection: ModuleGraphConnection, exportName?: (Dependency.ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
        getUsed(runtime: RuntimeSpec): UsageStateType;
        getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | import("../optimize/InlineExports").InlinedUsedName | false;
        hasUsedName(): boolean;
        setUsedName(name: string | import("../optimize/InlineExports").InlinedUsedName): void;
        getTerminalBinding(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
        isReexport(): boolean;
        _getMaxTarget(): ExportsInfo.Target;
        findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
        _findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
        getTarget(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
        hasCircularTarget(moduleGraph: ModuleGraph): boolean;
        _getTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): ExportsInfo.TargetItemWithConnection | unique symbol;
        moveTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => ModuleGraphConnection | undefined) | undefined): TargetItemWithConnection | undefined;
        createNestedExportsInfo(): ExportsInfo;
        getNestedExportsInfo(): ExportsInfo;
        hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
        updateHash(hash: import("../util/Hash"), runtime: RuntimeSpec): void;
        _updateHash(hash: import("../util/Hash"), runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
        getUsedInfo(): string;
        getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
        getRenameInfo(): string;
    };
    /**
     * Gets read only export info.
     * @param {Module} module the module
     * @param {string} exportName the export
     * @returns {InstanceType<ExportInfo>} info about the export (do not modify)
     */
    getReadOnlyExportInfo(module: Module, exportName: string): {
        name: Dependency.ExportInfoName;
        _usedName: ExportsInfo.ExportInfoUsedName;
        _globalUsed: ExportsInfo.UsageStateType | undefined;
        _usedInRuntime: ExportsInfo.UsedInRuntime | undefined;
        _hasUseInRuntimeInfo: boolean;
        provided: ExportsInfo.ExportInfoProvided | undefined;
        terminalBinding: boolean;
        canMangleProvide: boolean | undefined;
        _inlinedValue: import("../optimize/InlineExports").InlinedValue | undefined;
        canMangleUse: boolean | undefined;
        _inlineFlags: number;
        exportsInfoOwned: boolean;
        exportsInfo: ExportsInfo | undefined;
        _target: ExportsInfo.Target | undefined;
        _maxTarget: ExportsInfo.Target | undefined;
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
        unsetTarget(key: Dependency): boolean;
        setTarget(key: Dependency, connection: ModuleGraphConnection, exportName?: (Dependency.ExportInfoName[] | null) | undefined, priority?: number | undefined): boolean;
        getUsed(runtime: RuntimeSpec): UsageStateType;
        getUsedName(fallbackName: string | undefined, runtime: RuntimeSpec): string | import("../optimize/InlineExports").InlinedUsedName | false;
        hasUsedName(): boolean;
        setUsedName(name: string | import("../optimize/InlineExports").InlinedUsedName): void;
        getTerminalBinding(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): /*elided*/ any | ExportsInfo | undefined;
        isReexport(): boolean;
        _getMaxTarget(): ExportsInfo.Target;
        findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter): FoundTargetItem | null | undefined | false;
        _findTarget(moduleGraph: ModuleGraph, validTargetModuleFilter: ValidTargetModuleFilter, alreadyVisited: AlreadyVisitedExportInfo): FoundTargetItem | null | undefined | false;
        getTarget(moduleGraph: ModuleGraph, resolveTargetFilter?: ResolveTargetFilter): TargetItemWithConnection | undefined;
        hasCircularTarget(moduleGraph: ModuleGraph): boolean;
        _getTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, alreadyVisited: AlreadyVisitedExportInfo | undefined): ExportsInfo.TargetItemWithConnection | unique symbol;
        moveTarget(moduleGraph: ModuleGraph, resolveTargetFilter: ResolveTargetFilter, updateOriginalConnection?: ((target: TargetItemWithConnection) => ModuleGraphConnection | undefined) | undefined): TargetItemWithConnection | undefined;
        createNestedExportsInfo(): ExportsInfo;
        getNestedExportsInfo(): ExportsInfo;
        hasInfo(baseInfo: /*elided*/ any, runtime: RuntimeSpec): boolean;
        updateHash(hash: import("../util/Hash"), runtime: RuntimeSpec): void;
        _updateHash(hash: import("../util/Hash"), runtime: RuntimeSpec, alreadyVisitedExportsInfo: Set<ExportsInfo>): void;
        getUsedInfo(): string;
        getProvidedInfo(): "no provided info" | "maybe provided (runtime-defined)" | "provided" | "not provided";
        getRenameInfo(): string;
    };
    /**
     * Returns the used exports.
     * @param {Module} module the module
     * @param {RuntimeSpec} runtime the runtime
     * @returns {false | true | SortableSet<string> | null} the used exports
     * false: module is not used at all.
     * true: the module namespace/object export is used.
     * SortableSet<string>: these export names are used.
     * empty SortableSet<string>: module is used but no export.
     * null: unknown, worst case should be assumed.
     */
    getUsedExports(module: Module, runtime: RuntimeSpec): false | true | SortableSet<string> | null;
    /**
     * Gets pre order index.
     * @param {Module} module the module
     * @returns {number | null} the index of the module
     */
    getPreOrderIndex(module: Module): number | null;
    /**
     * Gets post order index.
     * @param {Module} module the module
     * @returns {number | null} the index of the module
     */
    getPostOrderIndex(module: Module): number | null;
    /**
     * Sets pre order index.
     * @param {Module} module the module
     * @param {number} index the index of the module
     * @returns {void}
     */
    setPreOrderIndex(module: Module, index: number): void;
    /**
     * Sets pre order index if unset.
     * @param {Module} module the module
     * @param {number} index the index of the module
     * @returns {boolean} true, if the index was set
     */
    setPreOrderIndexIfUnset(module: Module, index: number): boolean;
    /**
     * Sets post order index.
     * @param {Module} module the module
     * @param {number} index the index of the module
     * @returns {void}
     */
    setPostOrderIndex(module: Module, index: number): void;
    /**
     * Sets post order index if unset.
     * @param {Module} module the module
     * @param {number} index the index of the module
     * @returns {boolean} true, if the index was set
     */
    setPostOrderIndexIfUnset(module: Module, index: number): boolean;
    /**
     * Returns the depth of the module.
     * @param {Module} module the module
     * @returns {number | null} the depth of the module
     */
    getDepth(module: Module): number | null;
    /**
     * Updates depth using the provided module.
     * @param {Module} module the module
     * @param {number} depth the depth of the module
     * @returns {void}
     */
    setDepth(module: Module, depth: number): void;
    /**
     * Sets depth if lower.
     * @param {Module} module the module
     * @param {number} depth the depth of the module
     * @returns {boolean} true, if the depth was set
     */
    setDepthIfLower(module: Module, depth: number): boolean;
    /**
     * Checks whether this module graph is async.
     * @param {Module} module the module
     * @returns {boolean} true, if the module is async
     */
    isAsync(module: Module): boolean;
    /**
     * Checks whether this module graph is deferred.
     * @param {Module} module the module
     * @returns {boolean} true, if the module is used as a deferred module at least once
     */
    isDeferred(module: Module): boolean;
    /**
     * Updates async using the provided module.
     * @param {Module} module the module
     * @returns {void}
     */
    setAsync(module: Module): void;
    /**
     * Returns metadata.
     * @param {MetaKey} thing any thing
     * @returns {Meta} metadata
     */
    getMeta(thing: MetaKey): Meta;
    /**
     * Gets meta if existing.
     * @param {MetaKey} thing any thing
     * @returns {Meta | undefined} metadata
     */
    getMetaIfExisting(thing: MetaKey): Meta | undefined;
    /**
     * Processes the provided cache stage.
     * @param {string=} cacheStage a persistent stage name for caching
     */
    freeze(cacheStage?: string | undefined): void;
    unfreeze(): void;
    /**
     * Returns computed value or cached.
     * @template {TupleElement[]} T
     * @template R
     * @param {(moduleGraph: ModuleGraph, ...args: T) => R} fn computer
     * @param {T} args arguments
     * @returns {R} computed value or cached
     */
    cached<T extends WeakTupleMap.TupleElement[], R>(fn: (moduleGraph: ModuleGraph, ...args: T) => R, ...args: T): R;
    /**
     * Sets module mem caches.
     * @param {ModuleMemCaches} moduleMemCaches mem caches for modules for better caching
     */
    setModuleMemCaches(moduleMemCaches: ModuleMemCaches): void;
    /**
     * Dependency cache provide.
     * @template {Dependency} D
     * @template {TupleElement[]} ARGS
     * @template R
     * @param {D} dependency dependency
     * @param {[...ARGS, (moduleGraph: ModuleGraph, dependency: D, ...args: ARGS) => R]} args arguments, last argument is a function called with moduleGraph, dependency, ...args
     * @returns {R} computed value or cached
     */
    dependencyCacheProvide<D extends Dependency, ARGS extends WeakTupleMap.TupleElement[], R>(dependency: D, ...args: [...ARGS, (moduleGraph: ModuleGraph, dependency: D, ...args: ARGS) => R]): R;
}
declare namespace ModuleGraph {
    export { ModuleGraphConnection, OptimizationBailoutFunction, IncomingConnections, OutgoingConnections, Issuer, OptimizationBailouts, FilterConnection, MetaKey, LiveBinding, KnownMeta, Meta };
}
import type Module from "../module/Module";
/** @typedef {SortableSet<ModuleGraphConnection>} IncomingConnections */
/** @typedef {SortableSet<ModuleGraphConnection>} OutgoingConnections */
/** @typedef {Module | null | undefined} Issuer */
/** @typedef {(string | OptimizationBailoutFunction)[]} OptimizationBailouts */
declare class ModuleGraphModule {
    /** @type {IncomingConnections} */
    incomingConnections: IncomingConnections;
    /** @type {OutgoingConnections | undefined} */
    outgoingConnections: OutgoingConnections | undefined;
    /** @type {Issuer} */
    issuer: Issuer;
    /** @type {OptimizationBailouts} */
    optimizationBailout: OptimizationBailouts;
    /** @type {ExportsInfo} */
    exports: ExportsInfo;
    /** @type {number | null} */
    preOrderIndex: number | null;
    /** @type {number | null} */
    postOrderIndex: number | null;
    /** @type {number | null} */
    depth: number | null;
    /** @type {ModuleProfile | undefined} */
    profile: ModuleProfile | undefined;
    /** @type {boolean} */
    async: boolean;
    /** @type {ModuleGraphConnection[] | undefined} */
    _unassignedConnections: ModuleGraphConnection[] | undefined;
}
import type Dependency from "./Dependency";
import type DependenciesBlock from "./DependenciesBlock";
import ModuleGraphConnection = require("./ModuleGraphConnection");
import type ModuleProfile from "../module/ModuleProfile";
import ExportsInfo = require("./ExportsInfo");
import type { RuntimeSpec } from "../util/runtime";
import SortableSet = require("../util/SortableSet");
import WeakTupleMap = require("../util/WeakTupleMap");
import type { ModuleMemCaches } from "../Compilation";
/**
 * Defines the optimization bailout function callback.
 */
type OptimizationBailoutFunction = (requestShortener: RequestShortener) => string;
type IncomingConnections = SortableSet<ModuleGraphConnection>;
type OutgoingConnections = SortableSet<ModuleGraphConnection>;
type Issuer = Module | null | undefined;
type OptimizationBailouts = (string | OptimizationBailoutFunction)[];
type FilterConnection = (moduleGraphConnection: ModuleGraphConnection) => boolean;
type MetaKey = EXPECTED_OBJECT;
/**
 * A module-level `let` a module library declares in the chunk's scope instead.
 */
type LiveBinding = {
    /**
     * the name the chunk's scope declares
     */
    name: string;
    /**
     * the keys of the runtimes declaring it
     */
    runtimes: Set<string>;
    /**
     * the keys of the runtimes where a module mirrors it through the setters a module library registers, not by name
     */
    registered: Set<string>;
};
/**
 * Defines the known meta type used by this module.
 */
type KnownMeta = {
    importVarMap?: Map<Module, string> | undefined;
    deferredImportVarMap?: Map<Module, string> | undefined;
    /**
     * generate export definitions on demand
     */
    onDemandExports?: boolean | undefined;
    /**
     * module-level `let` names a module library declares in the chunk's scope instead
     */
    liveBindings?: Map<string, LiveBinding> | undefined;
    /**
     * module-level names a module keeps declared and mirrors to the chunk's scope on each write
     */
    liveSetters?: Map<string, LiveBinding> | undefined;
};
type Meta = KnownMeta & Record<symbol | symbol | symbol, string[]> & Record<string, EXPECTED_ANY>;
import type RequestShortener from "../util/RequestShortener";
