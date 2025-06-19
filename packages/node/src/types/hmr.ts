/**
 * Comprehensive TypeScript definitions for HMR (Hot Module Replacement) functionality
 * This file centralizes all HMR-related types to avoid duplication and improve maintainability.
 */

// =============================================================================
// CORE WEBPACK TYPES
// =============================================================================

/**
 * Extended webpack require function with HMR capabilities
 */
export interface HMRWebpackRequire {
  (id: string): any;
  /** Module cache */
  c: Record<string, HMRModule>;
  /** Module registry */
  m: Record<string, (...args: any[]) => any>;
  /** Object property check utility */
  o: (obj: any, prop: string) => boolean;
  /** Get chunk URL */
  u: (chunkId: string) => string;
  /** Get HMR update filename */
  hu?: (chunkId: string) => string;
  /** Get HMR manifest filename */
  hmrF?: () => string;
  /** Public path */
  p: string;
  /** Chunk loading functions */
  f?: {
    require?: (chunkId: string, promises: Promise<any>[]) => void;
    readFileVm?: (chunkId: string, promises: Promise<any>[]) => void;
    readFileVmHmr?: (chunkId: string, promises: Promise<any>[]) => void;
  };
  /** HMR-specific properties */
  hmrS_readFileVm?: { [chunkId: string]: any };
  hmrI: { [key: string]: any };
  hmrC: { [key: string]: any };
  hmrM?: () => Promise<HMRManifest | undefined>;
  hmrD?: { [moduleId: string]: any };
  /** In-memory HMR helpers */
  setInMemoryManifest?: (manifestContent: string) => void;
  setInMemoryChunk?: (chunkId: string, chunkContent: string) => void;
  /** Federation support */
  federation?: {
    runtime: {
      loadScriptNode: (url: string, options: { attrs: { globalName: string } }) => Promise<any>;
    };
    instance: any;
    chunkMatcher?: (chunkId: string) => boolean;
    rootOutputDir?: string;
    initOptions: {
      name: string;
      remotes: any;
    };
  };
}

/**
 * Module Hot API interface
 */
export interface ModuleHot {
  /** Get current HMR status */
  status(): string;
  /** Check for updates */
  check(autoApply?: boolean): Promise<string[] | null>;
  /** Accept dependencies for hot updates */
  accept(dependencies?: string | string[], callback?: () => void): void;
  /** Decline dependencies for hot updates */
  decline(dependencies?: string | string[]): void;
  /** Add dispose handler */
  dispose(callback: (data: any) => void): void;
  /** Add dispose handler (alias) */
  addDisposeHandler(callback: (data: any) => void): void;
  /** Remove dispose handler */
  removeDisposeHandler(callback: (data: any) => void): void;
  /** Add status handler */
  addStatusHandler?(callback: (status: string) => void): void;
  /** Remove status handler */
  removeStatusHandler?(callback: (status: string) => void): void;
  /** Apply updates */
  apply?(options?: any): Promise<string[]>;

  // Internal HMR properties
  _selfAccepted?: boolean | ((error: Error, context: any) => void);
  _selfInvalidated?: boolean;
  _selfDeclined?: boolean;
  _main?: boolean;
  _acceptedDependencies?: { [moduleId: string]: () => void };
  _acceptedErrorHandlers?: { [moduleId: string]: (error: Error, context: any) => void };
  _declinedDependencies?: { [moduleId: string]: boolean };
  _disposeHandlers?: ((data: any) => void)[];
  _requireSelf?: () => any;
  active?: boolean;
}

/**
 * Module object with HMR capabilities
 */
export interface ModuleObject {
  /** Hot Module Replacement API */
  hot?: ModuleHot;
  /** Module ID */
  id?: string;
  /** Module exports */
  exports?: any;
}

/**
 * HMR Module with parent/child relationships
 */
export interface HMRModule {
  /** Module ID */
  id: string;
  /** Hot API */
  hot: ModuleHot;
  /** Parent module IDs */
  parents: string[];
  /** Child module IDs */
  children: string[];
}

// =============================================================================
// HMR UPDATE AND MANIFEST TYPES
// =============================================================================

/**
 * HMR Update Manifest structure
 */
export interface HMRManifest {
  /** Current webpack hash */
  h: string;
  /** Chunk IDs that contain updates */
  c: string[];
  /** Chunk IDs to remove */
  r: string[];
  /** Module IDs that have updates */
  m: string[];
  [key: string]: any;
}

/**
 * Alias for backward compatibility
 */
export type HMRUpdateManifest = HMRManifest;

/**
 * HMR Update Data structure
 */
export interface HMRUpdateData {
  /** The HMR manifest containing update metadata */
  manifest: HMRManifest;
  /** The JavaScript code for the updated chunk */
  script: string;
  /** Original information about the update */
  originalInfo?: {
    /** Unique identifier for this update */
    updateId?: string;
    /** Webpack hash when the update was created */
    webpackHash?: string;
    /** Optional description */
    description?: string;
    /** Optional timestamp */
    timestamp?: number;
    /** Optional additional metadata */
    [key: string]: any;
  };
}

/**
 * HMR Update container
 */
export interface HMRUpdate {
  /** The actual update data */
  update: HMRUpdateData | null;
}

/**
 * Alias for backward compatibility
 */
export type UpdateData = HMRUpdate;

/**
 * Update chunk structure
 */
export interface UpdateChunk {
  /** Updated module factories */
  modules?: { [moduleId: string]: (...args: any[]) => any };
  /** Runtime update function */
  runtime?: (webpackRequire: any) => void;
  /** Chunk IDs */
  ids?: string[];
}

// =============================================================================
// CLIENT API TYPES
// =============================================================================

/**
 * HMR Client configuration options
 */
export interface HMRClientOptions {
  /** Whether to automatically attach to the webpack runtime */
  autoAttach?: boolean;
  /** Enable logging for debugging */
  logging?: boolean;
  /** Polling interval in milliseconds */
  pollingInterval?: number;
  /** Maximum number of retries for failed updates */
  maxRetries?: number;
}

/**
 * Update provider function type
 */
export interface UpdateProvider {
  (): Promise<HMRUpdate>;
}

/**
 * HMR operation result
 */
export interface CheckResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Reason for failure or success details */
  reason: 'no_provider' | 'no_updates' | 'updates_available' | 'update_applied' | 'check_error' | 'apply_error' | 'force_error';
  /** Human-readable message */
  message: string;
  /** The update data if applicable */
  updateData?: HMRUpdate;
  /** The update ID if applicable */
  updateId?: string;
  /** Update statistics */
  stats?: HMRStats;
  /** Error object if applicable */
  error?: Error;
}

/**
 * Alias for backward compatibility
 */
export type HMRUpdateResult = CheckResult;

/**
 * HMR Statistics
 */
export interface HMRStats {
  /** Total number of updates attempted */
  totalUpdates: number;
  /** Number of successful updates */
  successfulUpdates: number;
  /** Number of failed updates */
  failedUpdates: number;
  /** Timestamp of last update */
  lastUpdateTime: string | null;
}

/**
 * HMR Status information
 */
export interface HMRStatus {
  /** Whether HMR client is attached to webpack runtime */
  isAttached: boolean;
  /** Whether __webpack_require__ is available */
  hasWebpackRequire: boolean;
  /** Whether module.hot is available */
  hasModuleHot: boolean;
  /** Current hot status from webpack */
  hotStatus: string;
  /** Current webpack hash */
  webpackHash: string | null;
  /** Whether polling is active */
  isPolling: boolean;
  /** Whether an update provider is configured */
  hasUpdateProvider: boolean;
  /** Update statistics */
  stats: HMRStats;
}

/**
 * Polling configuration options
 */
export interface PollingOptions {
  /** Polling interval in milliseconds */
  interval?: number;
  /** Whether to use force mode (apply updates even when none detected) */
  forceMode?: boolean;
  /** Callback for successful updates */
  onUpdate?: (result: CheckResult) => void;
  /** Callback for errors */
  onError?: (result: CheckResult) => void;
}

/**
 * Alias for backward compatibility
 */
export type HMRPollingOptions = PollingOptions;

/**
 * Polling control interface
 */
export interface PollingControl {
  /** Stop the polling */
  stop: () => void;
}

/**
 * Alias for backward compatibility
 */
export type HMRPollingControl = PollingControl;

/**
 * Force update options
 */
export interface ForceUpdateOptions {
  /** Whether to create a minimal update for testing */
  createMinimalUpdate?: boolean;
  /** Predefined update data to use */
  updateData?: HMRUpdate;
}

// =============================================================================
// RUNTIME IMPLEMENTATION TYPES
// =============================================================================

/**
 * HMR Runtime state
 */
export interface HMRState {
  /** Current update chunks tracking */
  currentUpdateChunks?: { [chunkId: string]: boolean };
  /** Current update modules */
  currentUpdate: { [moduleId: string]: any } | undefined;
  /** Chunks to remove in current update */
  currentUpdateRemovedChunks: string[] | undefined;
  /** Runtime update functions */
  currentUpdateRuntime: ((webpackRequire: any) => void)[];
}

/**
 * Apply operation options
 */
export interface ApplyOptions {
  /** Ignore unaccepted modules */
  ignoreUnaccepted?: boolean;
  /** Ignore declined modules */
  ignoreDeclined?: boolean;
  /** Ignore errored modules */
  ignoreErrored?: boolean;
  /** Callback for unaccepted modules */
  onUnaccepted?: (info: any) => void;
  /** Callback for declined modules */
  onDeclined?: (info: any) => void;
  /** Callback for disposed modules */
  onDisposed?: (info: any) => void;
  /** Callback for accepted modules */
  onAccepted?: (info: any) => void;
  /** Callback for errored modules */
  onErrored?: (info: any) => void;
}

/**
 * Module effect analysis result
 */
export interface ModuleEffectResult {
  /** Type of effect */
  type: 'self-declined' | 'declined' | 'unaccepted' | 'accepted' | 'disposed';
  /** Module update chain */
  chain?: string[];
  /** Target module ID */
  moduleId: string;
  /** Parent module ID (for declined) */
  parentId?: string;
  /** Outdated modules list */
  outdatedModules?: string[];
  /** Outdated dependencies map */
  outdatedDependencies?: { [moduleId: string]: string[] };
}

/**
 * Apply operation result
 */
export interface ApplyResult {
  /** Error if apply failed */
  error?: Error;
  /** Dispose function */
  dispose?: () => void;
  /** Apply function */
  apply?: (reportError: (error: Error) => void) => string[];
}

/**
 * Outdated self-accepted module info
 */
export interface OutdatedSelfAcceptedModule {
  /** Module ID */
  module: string;
  /** Require function */
  require: ((moduleId: string) => any) | undefined;
  /** Error handler */
  errorHandler: ((error: Error, context: any) => void) | undefined;
}

/**
 * HMR Handlers interface
 */
export interface HMRHandlers {
  /** Initialize handler */
  hmrI: (moduleId: string, applyHandlers: ((options: ApplyOptions) => ApplyResult)[]) => void;
  /** Chunk handler */
  hmrC: (
    chunkIds: string[],
    removedChunks: string[],
    removedModules: string[],
    promises: Promise<any>[],
    applyHandlers: ((options: ApplyOptions) => ApplyResult)[],
    updatedModulesList: string[]
  ) => void;
}

/**
 * Complete HMR Runtime interface
 */
export interface HMRRuntime {
  /** Load update chunk function */
  loadUpdateChunk: (chunkId: string, updatedModulesList?: string[]) => Promise<void>;
  /** Apply handler function */
  applyHandler: (options: ApplyOptions) => ApplyResult;
  /** HMR handlers */
  hmrHandlers: HMRHandlers;
  /** HMR manifest loader */
  hmrManifestLoader: () => Promise<HMRManifest | undefined>;
}

// =============================================================================
// STORAGE AND STATE TYPES
// =============================================================================

/**
 * Installed chunks tracking
 */
export interface InstalledChunks {
  [chunkId: string]: any;
}

/**
 * In-memory chunks storage
 */
export interface InMemoryChunks {
  [chunkId: string]: string;
}

/**
 * Manifest reference for in-memory storage
 */
export interface ManifestRef {
  /** Manifest content value */
  value: string | null;
}

// =============================================================================
// CLIENT INTERFACE TYPES
// =============================================================================

/**
 * HMR Client interface
 */
export interface HMRClient {
  /** Initialize and attach the HMR runtime */
  attach(): boolean;
  /** Detach the HMR client and cleanup resources */
  detach(): void;
  /** Set an update provider function */
  setUpdateProvider(provider: UpdateProvider): void;
  /** Check for updates and apply them if available */
  checkForUpdates(options?: { autoApply?: boolean }): Promise<CheckResult>;
  /** Apply a specific update */
  applyUpdate(updateData: HMRUpdate): Promise<CheckResult>;
  /** Force a hot update regardless of whether updates are available */
  forceUpdate(options?: ForceUpdateOptions): Promise<CheckResult>;
  /** Start automatic polling for updates */
  startPolling(options?: PollingOptions): PollingControl;
  /** Stop automatic polling */
  stopPolling(): void;
  /** Get current HMR status and statistics */
  getStatus(): HMRStatus;
  /** Get update statistics */
  getStats(): HMRStats;
}

/**
 * HMR Client constructor interface
 */
export interface HMRClientConstructor {
  new (options?: HMRClientOptions): HMRClient;
  /** Create an HTTP-based update provider */
  createHttpUpdateProvider(url: string, options?: RequestInit): UpdateProvider;
  /** Create a queue-based update provider */
  createQueueUpdateProvider(updates: HMRUpdateData[]): UpdateProvider;
  /** Create a callback-based update provider */
  createCallbackUpdateProvider(callback: (currentHash?: string) => Promise<HMRUpdate>): UpdateProvider;
}

/**
 * HMR Client module interface
 */
export interface HMRClientModule {
  /** The HMR client class */
  HMRClient: HMRClientConstructor;
  /** Convenience function to create a new HMR client instance */
  createHMRClient(options?: HMRClientOptions): HMRClient;
}

// =============================================================================
// INTEGRATION AND CONFIGURATION TYPES
// =============================================================================

/**
 * HMR Integration options
 */
export interface HMRIntegrationOptions extends HMRClientOptions {
  /** Enable automatic polling for updates */
  enablePolling?: boolean;
  /** Update provider for the HMR client */
  updateProvider?: UpdateProvider;
}

/**
 * Federation HMR Update Provider options
 */
export interface FederationHMRUpdateProviderOptions {
  /** Endpoint to fetch updates from */
  endpoint?: string;
  /** Polling interval in milliseconds */
  pollInterval?: number;
  /** Enable webhook-based updates */
  enableWebhook?: boolean;
}

// =============================================================================
// UTILITY FUNCTIONS AND TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if we're in a webpack context
 */
export function isWebpackContext(): boolean {
  return typeof globalThis !== 'undefined' &&
         '__webpack_require__' in globalThis &&
         typeof (globalThis as any).__webpack_require__ === 'function';
}

/**
 * Get webpack require function if available
 */
export function getWebpackRequire(): HMRWebpackRequire | null {
  if (isWebpackContext()) {
    return (globalThis as any).__webpack_require__ as HMRWebpackRequire;
  }
  return null;
}

/**
 * Type guard to check if module has hot API
 */
export function hasModuleHot(module: any): module is ModuleObject {
  return module && typeof module === 'object' && module.hot && typeof module.hot === 'object';
}

/**
 * Type guard to check if webpack require has HMR capabilities
 */
export function hasHMRCapabilities(webpackRequire: any): webpackRequire is HMRWebpackRequire {
  return webpackRequire &&
         typeof webpackRequire === 'function' &&
         webpackRequire.hmrI &&
         webpackRequire.hmrC;
}

// =============================================================================
// LEGACY TYPE ALIASES (for backward compatibility)
// =============================================================================

/** @deprecated Use HMRManifest instead */
export type HMRUpdateManifest_Legacy = HMRManifest;

/** @deprecated Use UpdateProvider instead */
export type HMRUpdateProvider = UpdateProvider;

/** @deprecated Use CheckResult instead */
export type HMRUpdateResult_Legacy = CheckResult;

/** @deprecated Use HMRWebpackRequire instead */
export type WebpackRequireWithHMR = HMRWebpackRequire;

/** @deprecated Use ModuleHot instead */
export type WebpackHMRApi = ModuleHot;

/** @deprecated Use ModuleObject instead */
export type WebpackModule = ModuleObject;
