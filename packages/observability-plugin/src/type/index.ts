import type {
  BridgeConnectOptions,
  OpenRuntimeCore,
  OpenRuntimeWindowHost,
} from '@openruntime/core';
import type {
  ModuleFederation,
  ModuleFederationRuntimePlugin,
} from '@module-federation/runtime';

export interface OpenRuntimeObservabilityOptions {
  enabled?: boolean;
  runtime?: OpenRuntimeCore;
  host?: OpenRuntimeWindowHost;
  bridge?: false | BridgeConnectOptions;
  source?: string;
}

export type ObservabilityLevel = 'error' | 'summary' | 'verbose';

export type ObservabilityEventStatus =
  | 'start'
  | 'success'
  | 'error'
  | 'complete';

export type ObservabilityReportStatus = 'pending' | 'success' | 'error';

export type ObservabilityEventSource = 'runtime' | 'business' | 'react';

export type ObservabilityBrowserMode = 'development' | 'production';

export type ObservabilityReportOutcome =
  | 'pending'
  | 'runtime-loaded'
  | 'shared-resolved'
  | 'shared-registered'
  | 'preloaded'
  | 'component-loaded'
  | 'failed'
  | 'recovered';

export type ObservabilityOwnerHint =
  | 'host'
  | 'remote'
  | 'shared'
  | 'network'
  | 'runtime'
  | 'unknown';

export type ObservabilityMetadataValue = string | number | boolean;

export type ObservabilityMetadata = Record<string, ObservabilityMetadataValue>;

export type ObservabilityInstanceRole =
  | 'consumer'
  | 'producer'
  | 'mixed'
  | 'unknown';

export type ObservabilityRelationshipStatus =
  | 'resolved'
  | 'ambiguous'
  | 'unresolved';

export type ObservabilityCapabilityName =
  | 'instanceState'
  | 'remoteTrace'
  | 'sharedState'
  | 'sharedTrace'
  | 'bridgeTrace';

export interface ObservabilityCapability {
  available: boolean;
  completeness: 'complete' | 'partial' | 'unavailable';
  reason?: string;
}

export interface ObservabilityRuntimeStateRemote {
  name: string;
  alias?: string;
  version?: string;
  entry?: string;
  entryGlobalName?: string;
  type?: string;
}

export interface ObservabilityRuntimeStateInstance {
  instanceRef: string;
  name?: string;
  optionsName?: string;
  optionsVersion?: string;
  runtimeVersion?: string;
  role: ObservabilityInstanceRole;
  roleEvidence: {
    consumer: string[];
    producer: string[];
  };
  remotes: ObservabilityRuntimeStateRemote[];
  loadedProducers: ObservabilityRuntimeStateRemote[];
  shareScopes: Array<{
    name: string;
    sharedCount: number;
    sharedNames: string[];
    shared: Array<{
      name: string;
      versions: Array<{
        version: string;
        provider?: string;
        loaded?: boolean;
        singleton?: boolean;
        eager?: boolean;
        strategy?: string;
      }>;
    }>;
  }>;
  bridge?: {
    available: boolean;
    lifecycleCount?: number;
    framework?: 'react' | 'vue';
    moduleName?: string;
    remote?: string;
    expose?: string;
    status?: ObservabilityBridgeStatus;
    lastOperationAt?: number;
    routeSyncObserved?: boolean;
    states: ObservabilityBridgeState[];
  };
  active: boolean;
}

export type ObservabilityBridgeStatus =
  | 'idle'
  | 'rendering'
  | 'rendered'
  | 'destroying'
  | 'destroyed'
  | 'error';

export interface ObservabilityBridgeRouteSummary {
  action: string;
  from?: string;
  to?: string;
  basename?: string;
  mechanism?: 'popstate';
}

export interface ObservabilityBridgeInfo {
  operationId: string;
  bridgeId: string;
  side: 'consumer' | 'producer';
  framework: 'react' | 'vue';
  operation: 'render' | 'update' | 'destroy' | 'route-sync';
  moduleName?: string;
  remote?: string;
  expose?: string;
  route?: ObservabilityBridgeRouteSummary;
  reason?: string;
  startedAt: number;
  endedAt?: number;
  duration?: number;
  outcome?: 'success' | 'error' | 'skipped';
  error?: {
    name?: string;
    message?: string;
  };
}

export interface ObservabilityBridgeState {
  bridgeId: string;
  side: 'consumer' | 'producer';
  framework: 'react' | 'vue';
  moduleName?: string;
  remote?: string;
  expose?: string;
  status: ObservabilityBridgeStatus;
  lastOperation?: ObservabilityBridgeInfo['operation'];
  lastOperationId?: string;
  lastOperationAt?: number;
  routeSyncObserved: boolean;
}

export interface ObservabilityRuntimeRelationship {
  consumerInstanceRef: string;
  producerInstanceRef?: string;
  candidateProducerInstanceRefs?: string[];
  remote: ObservabilityRuntimeStateRemote;
  evidence: string[];
  status: ObservabilityRelationshipStatus;
}

export interface ObservabilityRuntimeModuleInfo {
  key: string;
  name?: string;
  version?: string;
  entry?: string;
  tag?: string;
  remotes?: ObservabilityRuntimeStateRemote[];
}

export interface ObservabilityRuntimeState {
  schemaVersion: 1;
  observedAt: number;
  scope: {
    name: string;
    realm: 'current';
    frame?: string;
  };
  completeness: {
    currentState: 'complete';
    history: 'complete' | 'partial';
    historyCleared: boolean;
    lateBoundInstanceRefs: string[];
    recommendation?: string;
  };
  capabilities: Record<ObservabilityCapabilityName, ObservabilityCapability>;
  instances: ObservabilityRuntimeStateInstance[];
  relationships: ObservabilityRuntimeRelationship[];
  moduleInfo: ObservabilityRuntimeModuleInfo[];
}

export interface ObservabilityModuleInfoEntry {
  name: string;
  publicPath?: string;
  getPublicPath?: string;
  remoteEntry?: string;
  globalName?: string;
}

export interface ObservabilityModuleInfoSummary {
  reason: string;
  clipped: true;
  totalCount: number;
  matchedCount: number;
  entries: ObservabilityModuleInfoEntry[];
  availableNames?: string[];
}

export interface ObservabilityPhaseSummary {
  status: ObservabilityEventStatus;
  duration?: number;
  cached?: boolean;
  recovered?: boolean;
  lifecycle?: string;
}

export interface ObservabilitySharedSummary {
  name: string;
  provider?: string;
  selectedVersion?: string;
  shareScope?: string[];
}

export interface ObservabilityLoadedBeforeConsumer {
  name?: string;
  remoteEntryExports?: boolean;
  containerInitialized?: boolean;
  exposes?: string[];
}

export interface ObservabilityLoadedBeforeInfo {
  producer: boolean;
  expose: boolean;
  consumers: ObservabilityLoadedBeforeConsumer[];
}

export interface ObservabilityReportFlags {
  cached: boolean;
  fallback: boolean;
  recovered: boolean;
}

export interface ObservabilityPhaseCollection {
  phases: Record<string, ObservabilityPhaseSummary>;
  shared?: ObservabilitySharedSummary;
  flags: ObservabilityReportFlags;
}

export interface ObservabilityErrorSummary {
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  failedPhase?: string;
  lifecycle?: string;
  ownerHint?: ObservabilityOwnerHint;
  retryable?: boolean;
  context?: ObservabilityMetadata;
}

export type ObservabilityActionId =
  | 'check-manifest-url'
  | 'check-remote-entry'
  | 'check-remote-global'
  | 'check-host-remotes'
  | 'check-shared-provider'
  | 'check-shared-version'
  | 'check-eager-config'
  | 'check-network'
  | 'check-expose'
  | 'check-module-info'
  | 'inspect-runtime-events';

export interface ObservabilityAction {
  id: ObservabilityActionId | string;
  ownerHint?: ObservabilityOwnerHint;
  title: string;
  detail?: string;
}

export interface ObservabilityFactReport {
  title: string;
  outcome: ObservabilityReportOutcome;
  status: ObservabilityReportStatus;
  ownerHint: ObservabilityOwnerHint;
  failedPhase?: string;
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  docLink?: string;
  facts: ObservabilityMetadata;
  completedPhases: string[];
  pendingPhases: string[];
  warnings?: string[];
  actions: ObservabilityAction[];
}

export interface ObservabilityRemoteInfo {
  name: string;
  alias?: string;
  entry?: string;
  entryGlobalName?: string;
  type?: string;
}

export interface ObservabilityResourceInfo {
  type: string;
  initiator: 'loadRemote' | 'preloadRemote' | 'loadShare';
  outcome?: 'success' | 'error' | 'timeout' | 'cached' | 'recovered';
  url?: string;
  startedAt: number;
  endedAt?: number;
  duration?: number;
  httpStatus?: number;
  mimeType?: string;
  redirected?: boolean;
  cacheSource?: string;
  errorType?: string;
}

export interface ObservabilitySharedInfo {
  name: string;
  shareScope?: string[];
  version?: string;
  requiredVersion?: string | false;
  selectedVersion?: string;
  availableVersions?: string[];
  provider?: string;
  useIn?: string[];
  singleton?: boolean;
  strictVersion?: boolean;
  eager?: boolean;
  strategy?: string;
  loaded?: boolean;
  loading?: boolean;
  reason?: string;
  definedBy?: 'bundler-runtime';
  conflict?: ObservabilitySharedConflictInfo;
  candidates?: ObservabilitySharedCandidate[];
  selectionReason?: string;
  failureReason?: string;
  loadType?: 'sync' | 'async';
  trigger?: string;
  moduleId?: string | number;
  chunkId?: string | number;
  remote?: string;
  expose?: string;
  requestId?: string;
  operationId?: string;
  fallback?: boolean;
  recovered?: boolean;
  registration?: ObservabilitySharedRegistration;
}

export interface ObservabilitySharedCandidate {
  scope: string;
  version: string;
  provider?: string;
  loaded: boolean;
  loading: boolean;
  singleton: boolean;
  eager: boolean;
  strategy?: string;
  compatible?: boolean;
  rejectionReason?: string;
}

export interface ObservabilitySharedRegistration {
  registrationId: string;
  action: 'registered' | 'replaced' | 'reused' | 'ignored';
  reason: string;
  trigger: string;
  scope: string;
  candidate: ObservabilitySharedCandidate;
  effective?: ObservabilitySharedCandidate;
}

export interface ObservabilitySharedConflictVersion {
  version: string;
  from?: string;
  singleton?: boolean;
  loaded?: boolean;
}

export interface ObservabilitySharedConflictInfo {
  reason: 'singleton-multiple-versions';
  scope: string;
  currentVersion?: string;
  currentFrom?: string;
  versions: string[];
  existingVersions: ObservabilitySharedConflictVersion[];
}

export interface ObservabilityEvent {
  traceId: string;
  instanceRef?: string;
  timestamp: number;
  phase: string;
  status: ObservabilityEventStatus;
  requestId?: string;
  requestAlias?: string;
  hostName?: string;
  runtimeVersion?: string;
  remote?: ObservabilityRemoteInfo;
  resource?: ObservabilityResourceInfo;
  shared?: ObservabilitySharedInfo;
  expose?: string;
  sanitizedUrl?: string;
  message?: string;
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  errorStack?: string;
  ownerHint?: ObservabilityOwnerHint;
  retryable?: boolean;
  errorContext?: ObservabilityMetadata;
  duration?: number;
  lifecycle?: string;
  eventName?: string;
  source?: ObservabilityEventSource;
  recovered?: boolean;
  cached?: boolean;
  componentName?: string;
  metadata?: ObservabilityMetadata;
  loadedBefore?: ObservabilityLoadedBeforeInfo;
  bridge?: ObservabilityBridgeInfo;
}

export interface ObservabilityReport {
  traceId: string;
  instanceRef?: string;
  status: ObservabilityReportStatus;
  requestId?: string;
  requestAlias?: string;
  hostName?: string;
  runtimeVersion?: string;
  remote?: ObservabilityRemoteInfo;
  shared?: ObservabilitySharedInfo;
  expose?: string;
  sanitizedUrl?: string;
  startedAt: number;
  updatedAt: number;
  duration: number;
  failedPhase?: string;
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  errorStack?: string;
  ownerHint?: ObservabilityOwnerHint;
  retryable?: boolean;
  errorContext?: ObservabilityMetadata;
  moduleInfo?: ObservabilityModuleInfoSummary;
  loadedBefore?: ObservabilityLoadedBeforeInfo;
  bridge?: ObservabilityBridgeInfo;
  events: ObservabilityEvent[];
  summary: {
    eventCount: number;
    recovered: boolean;
    loadCompleted: boolean;
    runtimeLoaded: boolean;
    sharedResolved: boolean;
    sharedRegistered: boolean;
    preloaded: boolean;
    componentLoaded: boolean;
    outcome: ObservabilityReportOutcome;
    lastPhase?: string;
    phases: Record<string, ObservabilityPhaseSummary>;
    shared?: ObservabilitySharedSummary;
    flags: ObservabilityReportFlags;
    error?: ObservabilityErrorSummary;
  };
  diagnosis?: ObservabilityFactReport;
}

export interface ObservabilityPluginOptions {
  enabled?: boolean;
  level?: ObservabilityLevel;
  maxEvents?: number;
  console?: boolean;
  collector?:
    | boolean
    | {
        enabled?: boolean;
        port?: number;
      };
  printRawStack?: boolean;
  stackTrace?: {
    enabled?: boolean;
    maxLines?: number;
    maxLength?: number;
  };
  browser?: {
    enabled?: boolean;
    scope?: string;
    mode?: ObservabilityBrowserMode;
  };
  trace?: {
    printStart?: boolean;
  };
  devtools?:
    | boolean
    | {
        enabled?: boolean;
        source?: string;
      };
  react?: {
    enabled?: boolean;
    injectLoadedCallback?: boolean;
    remoteIds?: string[];
    defaultExportMode?: 'preserve' | 'component';
  };
  onEvent?: (
    event: ObservabilityEvent,
    report: ObservabilityReport,
    context?: ObservabilityEventContext,
  ) => void;
  onReport?: (
    report: ObservabilityReport,
    context?: ObservabilityEventContext,
  ) => void;
  openRuntime?: boolean | OpenRuntimeObservabilityOptions;
  onRawError?: (error: unknown, context: ObservabilityRawErrorContext) => void;
}

export interface ObservabilityReportListOptions {
  limit?: number;
}

export interface ObservabilityReportQuery extends ObservabilityReportListOptions {
  traceId?: string;
  instanceRef?: string;
  remote?: string;
  expose?: string;
  shared?: string;
  status?: ObservabilityReportStatus;
  outcome?: ObservabilityReportOutcome;
}

export interface MarkComponentLoadedOptions {
  traceId?: string;
  requestId?: string;
  componentName?: string;
  metadata?: Record<string, unknown>;
}

export interface MFRemoteLoadedOptions {
  componentName?: string;
  metadata?: Record<string, unknown>;
}

export type OnMFRemoteLoaded = (options?: MFRemoteLoadedOptions) => void;

export interface ObservabilityController {
  plugin: ObservabilityRuntimePlugin;
  getEvents(): ObservabilityEvent[];
  getTraceIds(): string[];
  getReports(options?: ObservabilityReportListOptions): ObservabilityReport[];
  findReports(query?: ObservabilityReportQuery): ObservabilityReport[];
  getLatestReport(): ObservabilityReport | undefined;
  getReport(traceId: string): ObservabilityReport | undefined;
  exportReport(traceId?: string): ObservabilityReport | undefined;
  getRuntimeState(): ObservabilityRuntimeState;
  clear(): void;
  markComponentLoaded(
    options?: MarkComponentLoadedOptions,
  ): ObservabilityEvent | undefined;
}

export interface ObservabilityInstanceAPI {
  markComponentLoaded(
    options?: MarkComponentLoadedOptions,
  ): ObservabilityEvent | undefined;
}

export interface ObservabilityRuntimeAdapterOptions {
  pluginName?: string;
  fixedBrowserScope?: string;
  disableReact?: boolean;
  attachInstanceApi?: boolean;
  guardSharedHooksByRuntimeVersion?: boolean;
  guardRuntimeHooksByRuntimeVersion?: boolean;
  disablePreloadHooks?: boolean;
  returnHookArgs?: boolean;
  forceDevelopmentChannels?: boolean;
}

export type ObservableModuleFederation = ModuleFederation &
  ObservabilityInstanceAPI;

export interface ObservabilityRuntimeEventInput {
  phase: string;
  status: ObservabilityEventStatus;
  instanceRef?: string;
  requestId?: string;
  requestAlias?: string;
  hostName?: string;
  remote?: ObservabilityRemoteInfo;
  resource?: ObservabilityResourceInfo;
  shared?: ObservabilitySharedInfo;
  expose?: string;
  url?: string;
  message?: string;
  error?: unknown;
  errorContext?: Record<string, unknown>;
  duration?: number;
  lifecycle?: string;
  eventName?: string;
  source?: ObservabilityEventSource;
  recovered?: boolean;
  timestamp?: number;
  traceId?: string;
  cached?: boolean;
  componentName?: string;
  metadata?: Record<string, unknown>;
  loadedBefore?: ObservabilityLoadedBeforeInfo;
  bridge?: ObservabilityBridgeInfo;
}

export interface ObservabilityRuntimeOrigin {
  name?: string;
  version?: string;
  options?: {
    id?: string;
    name?: string;
    version?: string;
    remotes?: unknown;
    shared?: unknown;
    plugins?: unknown;
  };
  moduleCache?: ObservabilityRuntimeInstanceLike['moduleCache'];
  remoteHandler?: ObservabilityRuntimeRemoteHandlerLike;
  loaderHook?: {
    lifecycle?: {
      afterLoadEntry?: unknown;
    };
  };
  snapshotHandler?: {
    hooks?: {
      lifecycle?: {
        afterLoadManifest?: unknown;
      };
    };
  };
  bridgeHook?: unknown;
  shareScopeMap?: ObservabilityRuntimeShareScopeMap;
  sharedHandler?: {
    shareScopeMap?: ObservabilityRuntimeShareScopeMap;
    hooks?: {
      lifecycle?: Record<string, unknown>;
    };
  };
  loadShare?: (pkgName: string) => Promise<false | (() => unknown)>;
  loadShareSync?: (pkgName: string) => false | (() => unknown);
}

export interface ObservabilityEventContext {
  origin?: ObservabilityRuntimeOrigin;
  instanceRef?: string;
}

export interface ObservabilityRawErrorContext extends ObservabilityEventContext {
  event: ObservabilityEvent;
  report: ObservabilityReport;
}

export interface ObservabilityRuntimeSharedConfig {
  requiredVersion?: string | false;
  singleton?: boolean;
  strictVersion?: boolean;
  eager?: boolean;
}

export interface ObservabilityRuntimeSharedSource {
  version?: string;
  scope?: string | string[];
  from?: string;
  useIn?: string[];
  loaded?: boolean;
  loading?: unknown;
  strategy?: string;
  shareConfig?: ObservabilityRuntimeSharedConfig;
  get?: unknown;
  treeShaking?: {
    loaded?: boolean;
    loading?: unknown;
  };
}

export interface ObservabilityRuntimeSharedCandidate {
  scope: string;
  version: string;
  provider?: string;
  loaded: boolean;
  loading: boolean;
  singleton: boolean;
  eager: boolean;
  strategy?: string;
  compatible?: boolean;
  rejectionReason?: string;
}

export interface ObservabilityRuntimeSharedLoadContext {
  trigger?: string;
  moduleId?: string | number;
  chunkId?: string | number;
  remote?: string;
  expose?: string;
  requestId?: string;
  operationId?: string;
}

export interface ObservabilityRuntimeSharedSelectionResult {
  scope?: string;
  requestedVersion?: string;
  requiredVersion?: string | false;
  singleton?: boolean;
  strictVersion?: boolean;
  eager?: boolean;
  strategy?: string;
  candidates?: ObservabilityRuntimeSharedCandidate[];
  selected?: ObservabilityRuntimeSharedCandidate;
  reason?: string;
  failureReason?: string;
  fallback?: boolean;
  recovered?: boolean;
  loadType?: 'sync' | 'async';
  context?: ObservabilityRuntimeSharedLoadContext;
}

export interface ObservabilityRuntimeRemoteSource {
  name?: string;
  alias?: string;
  entry?: string;
  entryGlobalName?: string;
  type?: string;
}

export interface ObservabilityRuntimeOptions {
  name?: string;
  remotes?: ObservabilityRuntimeRemoteSource[];
}

export interface ObservabilityRemoteLoadArgs {
  id: string;
  pkgNameOrAlias?: string;
  expose?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  origin: ObservabilityRuntimeOrigin;
  exposeModule?: unknown;
  exposeModuleFactory?: unknown;
}

export interface ObservabilityBridgeOperationContext {
  side: 'consumer' | 'producer';
  framework: 'react' | 'vue';
  operation: 'render' | 'update' | 'destroy' | 'route-sync';
  target?: object;
  moduleName?: string;
  route?: ObservabilityBridgeRouteSummary;
  reason?: string;
}

export interface ObservabilityBridgeOperationResult {
  context: ObservabilityBridgeOperationContext;
  result?: unknown;
  error?: unknown;
}

export interface LegacyObservabilityBridgeHookArgs {
  operationId: string;
  bridgeId: string;
  side: ObservabilityBridgeOperationContext['side'];
  framework: ObservabilityBridgeOperationContext['framework'];
  operation: ObservabilityBridgeOperationContext['operation'];
  moduleName?: string;
  remote?: string;
  expose?: string;
  route?: ObservabilityBridgeOperationContext['route'];
  reason?: ObservabilityBridgeOperationContext['reason'];
  outcome?: 'success' | 'error' | 'skipped';
  error?: unknown;
  startedAt?: number;
  endedAt?: number;
}

export type ObservabilityBridgeHookArgs = (
  | ObservabilityBridgeOperationContext
  | ObservabilityBridgeOperationResult
  | LegacyObservabilityBridgeHookArgs
) & {
  origin?: ObservabilityRuntimeOrigin;
};

export interface ObservabilityRemoteBeforeRequestArgs {
  id: string;
  options?: ObservabilityRuntimeOptions;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilityRemoteAfterLoadArgs {
  id: string;
  expose?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  recovered?: boolean;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilityRemoteMatchArgs {
  id: string;
  options?: ObservabilityRuntimeOptions;
  expose?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  remoteInfo?: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilityRemoteSnapshotArgs {
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilityPreloadConfig {
  nameOrAlias?: string;
  exposes?: string[];
  resourceCategory?: 'all' | 'sync';
  share?: boolean;
  depsRemote?: boolean | unknown[];
}

export interface ObservabilityPreloadOption {
  remote?: ObservabilityRuntimeRemoteSource;
  preloadConfig?: ObservabilityPreloadConfig;
}

export interface ObservabilityPreloadAssetsArgs {
  origin: ObservabilityRuntimeOrigin;
  preloadOptions?: ObservabilityPreloadOption;
  remote?: ObservabilityRuntimeRemoteSource;
  remoteInfo?: ObservabilityRuntimeRemoteSource;
}

export interface ObservabilityPreloadAssetResult {
  url?: string;
  status?: 'success' | 'error' | 'timeout' | 'cached';
  resourceType?: string;
  initiator?: string;
  id?: string;
  error?: unknown;
}

export interface ObservabilityPreloadRemoteResult {
  remote?: ObservabilityRuntimeRemoteSource;
  remoteInfo?: ObservabilityRuntimeRemoteSource;
  preloadConfig?: ObservabilityPreloadConfig;
  id?: string;
  results?: ObservabilityPreloadAssetResult[];
}

export interface ObservabilityAfterPreloadRemoteArgs {
  origin: ObservabilityRuntimeOrigin;
  preloadOps?: ObservabilityPreloadConfig[];
  results?: ObservabilityPreloadRemoteResult[];
  error?: unknown;
}

export type ObservabilitySnapshotRemoteSource =
  ObservabilityRuntimeRemoteSource & {
    remoteEntry?: string;
    ssrRemoteEntry?: string;
  };

export interface ObservabilitySnapshotLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  moduleInfo?: ObservabilityRuntimeRemoteSource;
  remoteSnapshot?: ObservabilitySnapshotRemoteSource;
  id?: string;
  initiator?: 'loadRemote' | 'preloadRemote';
}

export interface ObservabilityRemoteSnapshotLoadArgs {
  moduleInfo?: ObservabilityRuntimeRemoteSource;
  manifestJson?: unknown;
  manifestUrl?: string;
  from?: 'global' | 'manifest';
}

export interface ObservabilityRemoteResolveArgs {
  id: string;
  expose?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  remoteInfo?: ObservabilityRuntimeRemoteSource;
  cached?: boolean;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilityRemoteErrorArgs {
  id: string;
  error: unknown;
  lifecycle?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  expose?: string;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilityRemoteEntryLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  remoteInfo: ObservabilityRuntimeRemoteSource;
  resourceContext?: ObservabilityResourceLoadContext;
}

export interface ObservabilityRemoteEntryAfterLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  remoteInfo: ObservabilityRuntimeRemoteSource;
  remoteEntryExports?: unknown;
  resourceContext?: ObservabilityResourceLoadContext;
  error?: unknown;
  recovered?: boolean;
  cached?: boolean;
}

export interface ObservabilityResourceLoadContext {
  id: string;
  initiator: 'loadRemote' | 'preloadRemote' | 'loadShare';
  resourceType: string;
  url?: string;
  expose?: string;
}

export interface ObservabilityResourceLoadArgs extends ObservabilityResourceLoadContext {
  origin: ObservabilityRuntimeOrigin;
  url: string;
  remote?: ObservabilityRuntimeRemoteSource;
  lifecycle?: string;
}

export interface ObservabilityResourceLoadResultArgs extends ObservabilityResourceLoadArgs {
  outcome: 'success' | 'error' | 'timeout' | 'cached' | 'recovered';
  response?: {
    status?: number;
    redirected?: boolean;
    headers?: {
      get?(name: string): string | null;
    };
  };
  httpStatus?: number;
  mimeType?: string;
  redirected?: boolean;
  cacheSource?: string;
  error?: unknown;
}

export interface ObservabilityManifestLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  manifestUrl: string;
  moduleInfo: ObservabilityRuntimeRemoteSource;
  resourceOptions?: {
    initiator?: 'loadRemote' | 'preloadRemote';
    id?: string;
    expose?: string;
  };
}

export interface ObservabilityManifestLoadResultArgs extends ObservabilityManifestLoadArgs {
  response?: ObservabilityResourceLoadResultArgs['response'];
  error?: unknown;
  cached?: boolean;
  recovered?: boolean;
}

export interface ObservabilityRemoteInitArgs {
  id?: string;
  remoteInfo: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  cached?: boolean;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilityRemoteExposeArgs {
  id: string;
  expose: string;
  moduleInfo: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilityRemoteFactoryArgs {
  id: string;
  expose: string;
  moduleInfo: ObservabilityRuntimeRemoteSource;
  loadFactory: boolean;
  error?: unknown;
  origin: ObservabilityRuntimeOrigin;
}

export type ObservabilityRuntimeShareScopeMap = Record<
  string,
  Record<string, Record<string, ObservabilityRuntimeSharedSource | undefined>>
>;

export interface ObservabilitySharedLifecycleArgs {
  pkgName: string;
  shareInfo?: ObservabilityRuntimeSharedSource;
  selectedShared?: ObservabilityRuntimeSharedSource;
  shared?: Record<string, ObservabilityRuntimeSharedSource[]>;
  shareScopeMap?: ObservabilityRuntimeShareScopeMap;
  lifecycle?: 'loadShare' | 'loadShareSync';
  origin: ObservabilityRuntimeOrigin;
  error?: unknown;
  recovered?: boolean;
  loadContext?: ObservabilityRuntimeSharedLoadContext;
}

export interface ObservabilitySharedRegistrationArgs {
  pkgName: string;
  scope: string;
  shared: ObservabilityRuntimeSharedSource;
  previousShared?: ObservabilityRuntimeSharedSource;
  registeredShared?: ObservabilityRuntimeSharedSource;
  shareScopeMap: ObservabilityRuntimeShareScopeMap;
  trigger: string;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilitySharedScopeInitArgs {
  shareScope: Record<string, unknown>;
  scopeName: string;
  origin: ObservabilityRuntimeOrigin;
}

export interface ObservabilitySharedResolveArgs {
  shareScopeMap: ObservabilityRuntimeShareScopeMap;
  scope: string;
  pkgName: string;
  version: string;
  shareInfo: ObservabilityRuntimeSharedSource;
  resolver: () =>
    | { shared: ObservabilityRuntimeSharedSource; useTreesShaking: boolean }
    | undefined;
  loadContext?: ObservabilityRuntimeSharedLoadContext;
  origin?: ObservabilityRuntimeOrigin;
}

export type ObservabilityRuntimePlugin = ModuleFederationRuntimePlugin;

export type GeneratePreloadAssetsResult = Awaited<
  ReturnType<NonNullable<ObservabilityRuntimePlugin['generatePreloadAssets']>>
>;

export interface ObservabilityBrowserReader {
  getEvents(): ObservabilityEvent[];
  getTraceIds(): string[];
  getReports(options?: ObservabilityReportListOptions): ObservabilityReport[];
  findReports(query?: ObservabilityReportQuery): ObservabilityReport[];
  getLatestReport(): ObservabilityReport | undefined;
  getReport(traceId: string): ObservabilityReport | undefined;
  exportReport(traceId?: string): ObservabilityReport | undefined;
  getRuntimeState(): ObservabilityRuntimeState;
}

export interface FederationObservabilityGlobal {
  __OBSERVABILITY__?: Record<string, ObservabilityBrowserReader>;
  __INSTANCES__?: ObservabilityRuntimeInstanceLike[];
  moduleInfo?: Record<string, unknown>;
}

export interface ObservabilityRuntimeModuleLike {
  remoteInfo?: ObservabilityRuntimeRemoteSource;
  remoteEntryExports?: unknown;
  inited?: boolean;
}

export interface ObservabilityRuntimeRemoteHandlerLike {
  idToRemoteMap?: Record<string, { name?: string; expose?: string }>;
}

export interface ObservabilityRuntimeInstanceLike extends ObservabilityRuntimeOrigin {
  moduleCache?:
    | Map<unknown, unknown>
    | {
        entries?: () => IterableIterator<[unknown, unknown]>;
      }
    | Record<string, unknown>;
  remoteHandler?: ObservabilityRuntimeRemoteHandlerLike;
}

export interface ObservabilityReactLike {
  createElement: (
    type: unknown,
    props?: Record<string, unknown> | null,
    ...children: unknown[]
  ) => unknown;
}

export interface ObservabilityCollectorOptions {
  enabled: true;
  port: number;
}

export interface ObservabilityDevtoolsOptions {
  enabled: true;
  source: string;
}

export type ObservabilityFetch = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    keepalive?: boolean;
    credentials?: 'omit';
    mode?: 'cors';
  },
) => Promise<unknown>;
