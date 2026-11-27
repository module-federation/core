declare namespace _exports {
    export { ModuleId, HotData, DisposeHandler, AcceptCallback, AcceptErrorHandler, SelfAcceptErrorHandler, ModuleFactory, HotErrorEvent, ApplyFn, ApplyOptions, ApplyResult, ApplyHandler, InvalidateModuleHandler, DownloadUpdateHandler, EnsureChunkHandler, RuntimeModuleFn, InstalledChunk, Hot, HotModule, ModuleEffect, QueueItem, SelfAcceptedModule };
}
declare function _exports(): void;
export = _exports;
type ModuleId = string | number;
type HotData = object;
type DisposeHandler = (data: HotData) => void;
type AcceptCallback = (outdatedDependencies: ModuleId[]) => void | Promise<void>;
type AcceptErrorHandler = (err: unknown, context: {
    moduleId: ModuleId;
    dependencyId: ModuleId;
}) => void;
type SelfAcceptErrorHandler = (err: unknown, context: {
    moduleId: ModuleId;
    module: HotModule;
}) => void;
type ModuleFactory = (module: HotModule, exports: EXPECTED_OBJECT, require: typeof __webpack_require__) => void;
type HotErrorEvent = {
    type: string;
    moduleId: ModuleId;
    dependencyId?: ModuleId;
    error: unknown;
    originalError?: unknown;
};
type ApplyFn = (reportError: (err: unknown) => void) => Promise<ModuleId[]>;
type ApplyOptions = {
    /**
     * ignore unaccepted modules
     */
    ignoreUnaccepted?: boolean | undefined;
    /**
     * ignore declined modules
     */
    ignoreDeclined?: boolean | undefined;
    /**
     * ignore errors thrown while applying
     */
    ignoreErrored?: boolean | undefined;
    /**
     * called for declined modules
     */
    onDeclined?: ((event: ModuleEffect) => void) | undefined;
    /**
     * called for unaccepted modules
     */
    onUnaccepted?: ((event: ModuleEffect) => void) | undefined;
    /**
     * called for accepted modules
     */
    onAccepted?: ((event: ModuleEffect) => void) | undefined;
    /**
     * called for disposed modules
     */
    onDisposed?: ((event: ModuleEffect) => void) | undefined;
    /**
     * called on apply errors
     */
    onErrored?: ((event: HotErrorEvent) => void) | undefined;
};
type ApplyResult = {
    /**
     * fatal error that aborts the update
     */
    error?: Error | undefined;
    /**
     * dispose phase of the update
     */
    dispose?: (() => void) | undefined;
    /**
     * apply phase of the update
     */
    apply?: ApplyFn | undefined;
};
type ApplyHandler = (options: ApplyOptions) => ApplyResult;
type InvalidateModuleHandler = (moduleId: ModuleId, applyHandlers: ApplyHandler[]) => void;
type DownloadUpdateHandler = (chunkIds: ModuleId[], removedChunks: ModuleId[], removedModules: ModuleId[], promises: (Promise<void> | undefined)[], applyHandlers: ApplyHandler[], updatedModulesList: ModuleId[], css: ModuleId[] | undefined, forceLoadChunks: ModuleId[] | undefined) => void;
type EnsureChunkHandler = (chunkId: ModuleId, promises: (Promise<void> | undefined)[]) => void;
type RuntimeModuleFn = (webpackRequire: typeof __webpack_require__) => void;
type InstalledChunk = 0 | 1 | null | [() => void, Promise<void>] | [() => void, (err: Error) => void, Promise<void>];
type Hot = {
    /**
     * accept callbacks by dependency id
     */
    _acceptedDependencies: Record<ModuleId, AcceptCallback>;
    /**
     * error handlers by dependency id
     */
    _acceptedErrorHandlers: Record<ModuleId, AcceptErrorHandler | undefined>;
    /**
     * declined dependency ids
     */
    _declinedDependencies: Record<ModuleId, boolean>;
    /**
     * true or the self-accept error handler
     */
    _selfAccepted: boolean | SelfAcceptErrorHandler;
    /**
     * module declined itself
     */
    _selfDeclined: boolean;
    /**
     * module invalidated itself
     */
    _selfInvalidated: boolean;
    /**
     * registered dispose handlers
     */
    _disposeHandlers: DisposeHandler[];
    /**
     * module is the entry of the update
     */
    _main: boolean;
    /**
     * re-require the module on apply
     */
    _requireSelf: () => void;
    /**
     * module is not disposed
     */
    active: boolean;
};
type HotModule = {
    /**
     * module id
     */
    id: ModuleId;
    /**
     * hot API of the module
     */
    hot: Hot;
    /**
     * ids of modules requiring this module
     */
    parents: ModuleId[];
    /**
     * ids of modules required by this module
     */
    children: ModuleId[];
};
type ModuleEffect = {
    /**
     * effect type
     */
    type: string;
    /**
     * affected module id
     */
    moduleId: ModuleId;
    /**
     * update propagation chain
     */
    chain?: ModuleId[] | undefined;
    /**
     * declining parent id
     */
    parentId?: ModuleId | undefined;
    /**
     * outdated module ids
     */
    outdatedModules?: ModuleId[] | undefined;
    /**
     * outdated dependencies by module id
     */
    outdatedDependencies?: Record<ModuleId, ModuleId[]> | undefined;
};
type QueueItem = {
    chain: ModuleId[];
    id: ModuleId;
};
type SelfAcceptedModule = {
    module: ModuleId;
    require: (id?: ModuleId) => void;
    errorHandler: boolean | SelfAcceptErrorHandler;
};
/** @type {(id: ModuleId) => unknown} */
declare var __webpack_require__: (id: ModuleId) => unknown;
