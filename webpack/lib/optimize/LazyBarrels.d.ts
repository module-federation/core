export = LazyBarrels;
/**
 * Owns the lazy barrel state of side-effect-free modules for a `Compilation`.
 */
declare class LazyBarrels {
    /**
     * Returns whether the lazy barrel of the module graph's compilation defers the dependency.
     * @param {ModuleGraph} moduleGraph the module graph
     * @param {Dependency} dependency the dependency
     * @returns {boolean} true while deferred
     */
    static isLazy(moduleGraph: ModuleGraph, dependency: Dependency): boolean;
    /**
     * @param {Compilation} compilation the owning compilation
     */
    constructor(compilation: Compilation);
    /** @type {Compilation} */
    _compilation: Compilation;
    /** @type {WeakMap<Module, LazyBarrelState>} */
    _modules: WeakMap<Module, LazyBarrelState>;
    /** @type {WeakSet<Dependency>} */
    _lazyDependencies: WeakSet<Dependency>;
    /** @type {boolean} */
    _canLazyImports: boolean;
    /**
     * Releases all state; its last readers are the dependency templates during code generation.
     */
    clear(): void;
    /**
     * Returns whether the dependency is deferred, so its target module is not created.
     * @param {Dependency} dependency the dependency
     * @returns {boolean} true while deferred
     */
    isLazy(dependency: Dependency): boolean;
    /**
     * Returns the requests `module` still defers, for `FlagDependencyExportsPlugin`'s cache key.
     * @param {Module} module the module
     * @returns {Iterable<string> | undefined} still-deferred requests, if any
     */
    getLazyRequests(module: Module): Iterable<string> | undefined;
    /**
     * Defers the re-export targets of a side-effect-free module, replaying names requested earlier.
     * @param {Module} module the module whose dependencies are processed
     * @returns {boolean} true, when some dependencies were deferred
     */
    classify(module: Module): boolean;
    /**
     * Requests the export names `dependencies` need from a lazy barrel.
     * @param {Module} module the resolved module
     * @param {Dependency[]} dependencies the dependencies that resolved to the module
     * @returns {UnlazyDependencyInfo[] | undefined} deferred groups to process now, if any
     */
    request(module: Module, dependencies: Dependency[]): UnlazyDependencyInfo[] | undefined;
    /**
     * Queues the deferred groups a single dependency requests from a lazy barrel.
     * @param {Module} module the resolved module of the dependency
     * @param {Dependency} dependency the requesting dependency
     * @param {{ factory: ModuleFactory, dependencies: Dependency[], context: string | undefined, originModule: Module | null }[]} sortedDependencies item list to append to
     */
    unlazyForDependency(module: Module, dependency: Dependency, sortedDependencies: {
        factory: ModuleFactory;
        dependencies: Dependency[];
        context: string | undefined;
        originModule: Module | null;
    }[]): void;
    /**
     * Collects the deferrable dependencies of a side-effect-free module.
     * @param {Dependency[]} dependencies dependencies of the module
     * @param {Set<string> | true | undefined} forwardedIds names requested before classification
     * @returns {LazyBarrelInfo | undefined} deferral info, undefined when nothing is deferrable
     */
    _createInfo(dependencies: Dependency[], forwardedIds: Set<string> | true | undefined): LazyBarrelInfo | undefined;
    /**
     * Returns the factory of a dependency the barrel can defer.
     * @param {Dependency} dependency the dependency
     * @returns {ModuleFactory | undefined} factory, undefined when not deferrable
     */
    _getDepFactory(dependency: Dependency): ModuleFactory | undefined;
    /**
     * Collects the export names `dependencies` request from `module`, registering star re-export targets.
     * @param {Module} module the module the dependencies resolved to
     * @param {Dependency[]} dependencies the dependencies that resolved to the module
     * @returns {Set<string> | true} requested export names, true for all
     */
    _getRequestedIds(module: Module, dependencies: Dependency[]): Set<string> | true;
    /**
     * Requests names from a module and collects the groups they activate, following resolved star re-exports.
     * @param {Module} module the resolved module
     * @param {Set<string> | true} ids requested export names, true for all
     * @param {UnlazyDependencyInfo[] | undefined} items items collected so far
     * @returns {UnlazyDependencyInfo[] | undefined} items to process, if any
     */
    _requestWithIds(module: Module, ids: Set<string> | true, items: UnlazyDependencyInfo[] | undefined): UnlazyDependencyInfo[] | undefined;
}
declare namespace LazyBarrels {
    export { DependencyGroup, UnlazyDependencyInfo, LazyBarrelState, LazyBarrelRequest };
}
import type Compilation from "../Compilation";
import type Module from "../module/Module";
import Dependency = require("../graph/Dependency");
import type ModuleFactory from "../module/ModuleFactory";
/**
 * Deferred dependencies of a side-effect-free barrel and the export names activating them.
 */
declare class LazyBarrelInfo {
    /**
     * @param {WeakSet<Dependency>} lazyDependencies the compilation's deferred dependencies
     */
    constructor(lazyDependencies: WeakSet<Dependency>);
    /** @type {WeakSet<Dependency>} */
    _dependencies: WeakSet<Dependency>;
    /** @type {Map<string, string | Set<string>> | undefined} export name -> request key(s) */
    _forwardIdToRequest: Map<string, string | Set<string>> | undefined;
    /** @type {Map<string, DependencyGroup>} request key -> still-deferred group */
    _requestToDepGroup: Map<string, DependencyGroup>;
    /** @type {Set<string> | undefined} star re-export requests */
    _fallbackRequests: Set<string> | undefined;
    /** @type {Set<Module> | undefined} resolved star re-export targets */
    _fallbackTargetModules: Set<Module> | undefined;
    /**
     * Records a deferred dependency under its request key.
     * @param {string} requestKey request key
     * @param {Dependency} dependency dependency to defer
     * @param {ModuleFactory} factory factory for the request
     */
    addLazy(requestKey: string, dependency: Dependency, factory: ModuleFactory): void;
    /**
     * Maps an export name to the request(s) needed to provide it.
     * @param {string} id export name
     * @param {string | Set<string>} requestKeys request key, or the lazy import requests of a local export
     */
    addForwardId(id: string, requestKeys: string | Set<string>): void;
    /**
     * Registers a star re-export request.
     * @param {string} requestKey request key
     */
    addFallback(requestKey: string): void;
    /**
     * Records a resolved star re-export target, so later names reach it without re-factorizing.
     * @param {Module} module the target module
     */
    addFallbackTarget(module: Module): void;
    /**
     * Returns whether a local export or named re-export provides the name.
     * @param {string} id export name
     * @returns {boolean} true, when the name does not need a star re-export
     */
    isKnownId(id: string): boolean;
    /**
     * Returns whether nothing is deferred.
     * @returns {boolean} true, when no dependency is deferred
     */
    isEmpty(): boolean;
    /**
     * Returns the requests of the still-deferred groups.
     * @returns {Iterable<string>} still-deferred requests
     */
    getLazyRequests(): Iterable<string>;
    /**
     * Activates the deferred groups needed to provide newly requested export names.
     * @param {Set<string> | true} ids newly requested export names, true for all
     * @returns {LazyBarrelRequest} activated groups and the names to forward to star targets
     */
    request(ids: Set<string> | true): LazyBarrelRequest;
    /**
     * Activates the groups providing `ids` and returns the names only a star re-export may provide.
     * @param {Set<string>} ids requested export names
     * @param {DependencyGroup[]} groups activated groups
     * @returns {Set<string> | undefined} names no known export provides
     */
    _takeIds(ids: Set<string>, groups: DependencyGroup[]): Set<string> | undefined;
    /**
     * Activates a deferred group and appends it to `groups`.
     * @param {string} requestKey request key
     * @param {DependencyGroup[]} groups activated groups
     */
    _take(requestKey: string, groups: DependencyGroup[]): void;
    /**
     * Releases the name lookups once nothing needs forwarding.
     */
    _release(): void;
}
import type ModuleGraph from "../graph/ModuleGraph";
/**
 * Deferred dependencies sharing one request.
 */
type DependencyGroup = {
    /**
     * factory for the request
     */
    factory: ModuleFactory;
    /**
     * deferred dependencies of the request
     */
    dependencies: Dependency[];
    /**
     * request context
     */
    context: string | undefined;
};
/**
 * A deferred group to process now, with the barrel it belongs to.
 */
type UnlazyDependencyInfo = {
    /**
     * factory for the request
     */
    factory: ModuleFactory;
    /**
     * deferred dependencies of the request
     */
    dependencies: Dependency[];
    /**
     * request context
     */
    context: string | undefined;
    /**
     * the lazy barrel module
     */
    originModule: Module;
};
/**
 * Per-module lazy barrel state.
 */
type LazyBarrelState = {
    /**
     * export names requested so far, true for all
     */
    forwardedIds: Set<string> | true;
    /**
     * deferred dependencies, undefined until classified
     */
    lazyBarrelInfo: LazyBarrelInfo | undefined;
};
/**
 * Result of requesting names from a lazy barrel.
 */
type LazyBarrelRequest = {
    /**
     * groups that must be processed now
     */
    groups: DependencyGroup[];
    /**
     * names only a star re-export may provide
     */
    fallbackIds: Set<string> | true | undefined;
    /**
     * resolved star re-export targets to forward them to
     */
    fallbackTargets: Module[] | undefined;
};
