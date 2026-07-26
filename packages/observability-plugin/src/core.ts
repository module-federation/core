import type {
  ModuleFederation,
  ModuleFederationRuntimePlugin,
  RuntimePluginHooks,
  BridgeOperationContext,
  BridgeOperationResult,
} from '@module-federation/runtime';
import { satisfy } from '@module-federation/runtime';
import { createLogger, isDebugMode } from '@module-federation/sdk';

import {
  createOpenRuntimeObservabilityAdapter,
  type OpenRuntimeObservabilityOptions,
} from './openruntime';

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
    commitObserved?: boolean;
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
  commitObserved: boolean;
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
  initiator: 'loadRemote' | 'preloadRemote';
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

type ObservableModuleFederation = ModuleFederation & ObservabilityInstanceAPI;

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
      beforeLoadResource?: unknown;
      afterLoadResource?: unknown;
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

interface ObservabilityRuntimeSharedConfig {
  requiredVersion?: string | false;
  singleton?: boolean;
  strictVersion?: boolean;
  eager?: boolean;
}

interface ObservabilityRuntimeSharedSource {
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

interface ObservabilityRuntimeSharedCandidate {
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

interface ObservabilityRuntimeSharedLoadContext {
  trigger?: string;
  moduleId?: string | number;
  chunkId?: string | number;
  remote?: string;
  expose?: string;
  requestId?: string;
  operationId?: string;
  customResolver?: boolean;
}

interface ObservabilityRuntimeSharedSelectionResult {
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

interface ObservabilityRuntimeRemoteSource {
  name?: string;
  alias?: string;
  entry?: string;
  entryGlobalName?: string;
  type?: string;
}

interface ObservabilityRuntimeOptions {
  name?: string;
  remotes?: ObservabilityRuntimeRemoteSource[];
}

interface ObservabilityRemoteLoadArgs {
  id: string;
  pkgNameOrAlias?: string;
  expose?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  origin: ObservabilityRuntimeOrigin;
  exposeModule?: unknown;
  exposeModuleFactory?: unknown;
}

interface LegacyObservabilityBridgeHookArgs {
  operationId: string;
  bridgeId: string;
  side: BridgeOperationContext['side'];
  framework: BridgeOperationContext['framework'];
  operation: BridgeOperationContext['operation'];
  moduleName?: string;
  remote?: string;
  expose?: string;
  route?: BridgeOperationContext['route'];
  reason?: BridgeOperationContext['reason'];
  outcome?: 'success' | 'error' | 'skipped';
  error?: unknown;
  startedAt?: number;
  endedAt?: number;
}

type ObservabilityBridgeHookArgs = (
  | BridgeOperationContext
  | BridgeOperationResult
  | LegacyObservabilityBridgeHookArgs
) & {
  origin?: ObservabilityRuntimeOrigin;
};

interface ObservabilityRemoteBeforeRequestArgs {
  id: string;
  options?: ObservabilityRuntimeOptions;
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilityRemoteAfterLoadArgs {
  id: string;
  expose?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  recovered?: boolean;
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilityRemoteMatchArgs {
  id: string;
  options?: ObservabilityRuntimeOptions;
  expose?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  remoteInfo?: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilityRemoteSnapshotArgs {
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilityPreloadConfig {
  nameOrAlias?: string;
  exposes?: string[];
  resourceCategory?: 'all' | 'sync';
  share?: boolean;
  depsRemote?: boolean | unknown[];
}

interface ObservabilityPreloadOption {
  remote?: ObservabilityRuntimeRemoteSource;
  preloadConfig?: ObservabilityPreloadConfig;
}

interface ObservabilityPreloadAssetsArgs {
  origin: ObservabilityRuntimeOrigin;
  preloadOptions?: ObservabilityPreloadOption;
  remote?: ObservabilityRuntimeRemoteSource;
  remoteInfo?: ObservabilityRuntimeRemoteSource;
}

interface ObservabilityPreloadAssetResult {
  url?: string;
  status?: 'success' | 'error' | 'timeout' | 'cached';
  resourceType?: string;
  initiator?: string;
  id?: string;
  error?: unknown;
}

interface ObservabilityPreloadRemoteResult {
  remote?: ObservabilityRuntimeRemoteSource;
  remoteInfo?: ObservabilityRuntimeRemoteSource;
  preloadConfig?: ObservabilityPreloadConfig;
  id?: string;
  results?: ObservabilityPreloadAssetResult[];
}

interface ObservabilityAfterPreloadRemoteArgs {
  origin: ObservabilityRuntimeOrigin;
  preloadOps?: ObservabilityPreloadConfig[];
  results?: ObservabilityPreloadRemoteResult[];
  error?: unknown;
}

type ObservabilitySnapshotRemoteSource = ObservabilityRuntimeRemoteSource & {
  remoteEntry?: string;
  ssrRemoteEntry?: string;
};

interface ObservabilitySnapshotLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  moduleInfo?: ObservabilityRuntimeRemoteSource;
  remoteSnapshot?: ObservabilitySnapshotRemoteSource;
  id?: string;
  initiator?: 'loadRemote' | 'preloadRemote';
}

interface ObservabilityRemoteSnapshotLoadArgs {
  moduleInfo?: ObservabilityRuntimeRemoteSource;
  manifestJson?: unknown;
  manifestUrl?: string;
  from?: 'global' | 'manifest';
}

interface ObservabilityRemoteResolveArgs {
  id: string;
  expose?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  remoteInfo?: ObservabilityRuntimeRemoteSource;
  cached?: boolean;
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilityRemoteErrorArgs {
  id: string;
  error: unknown;
  lifecycle?: string;
  remote?: ObservabilityRuntimeRemoteSource;
  expose?: string;
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilityRemoteEntryLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  remoteInfo: ObservabilityRuntimeRemoteSource;
}

interface ObservabilityRemoteEntryAfterLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  remoteInfo: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  recovered?: boolean;
  cached?: boolean;
}

interface ObservabilityResourceLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  id: string;
  initiator: 'loadRemote' | 'preloadRemote';
  resourceType: string;
  url: string;
  remote?: ObservabilityRuntimeRemoteSource;
  expose?: string;
}

interface ObservabilityResourceLoadResultArgs extends ObservabilityResourceLoadArgs {
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

interface ObservabilityManifestLoadArgs {
  origin: ObservabilityRuntimeOrigin;
  manifestUrl: string;
  moduleInfo: ObservabilityRuntimeRemoteSource;
  resourceOptions?: {
    initiator?: 'loadRemote' | 'preloadRemote';
    id?: string;
  };
}

interface ObservabilityManifestLoadResultArgs extends ObservabilityManifestLoadArgs {
  response?: ObservabilityResourceLoadResultArgs['response'];
  error?: unknown;
  cached?: boolean;
  recovered?: boolean;
}

interface ObservabilityRemoteInitArgs {
  id?: string;
  remoteInfo: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  cached?: boolean;
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilityRemoteExposeArgs {
  id: string;
  expose: string;
  moduleInfo: ObservabilityRuntimeRemoteSource;
  error?: unknown;
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilityRemoteFactoryArgs {
  id: string;
  expose: string;
  moduleInfo: ObservabilityRuntimeRemoteSource;
  loadFactory: boolean;
  error?: unknown;
  origin: ObservabilityRuntimeOrigin;
}

type ObservabilityRuntimeShareScopeMap = Record<
  string,
  Record<string, Record<string, ObservabilityRuntimeSharedSource | undefined>>
>;

interface ObservabilitySharedLifecycleArgs {
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

interface ObservabilitySharedRegistrationArgs {
  pkgName: string;
  scope: string;
  shared: ObservabilityRuntimeSharedSource;
  previousShared?: ObservabilityRuntimeSharedSource;
  registeredShared?: ObservabilityRuntimeSharedSource;
  shareScopeMap: ObservabilityRuntimeShareScopeMap;
  trigger: string;
  origin: ObservabilityRuntimeOrigin;
}

interface ObservabilitySharedResolveArgs {
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
type GeneratePreloadAssetsResult = Awaited<
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

interface FederationObservabilityGlobal {
  __OBSERVABILITY__?: Record<string, ObservabilityBrowserReader>;
  __INSTANCES__?: ObservabilityRuntimeInstanceLike[];
  moduleInfo?: Record<string, unknown>;
}

interface ObservabilityRuntimeModuleLike {
  remoteInfo?: ObservabilityRuntimeRemoteSource;
  remoteEntryExports?: unknown;
  inited?: boolean;
}

function continuePreloadAssetsGeneration(): GeneratePreloadAssetsResult {
  return undefined as unknown as GeneratePreloadAssetsResult;
}

interface ObservabilityRuntimeRemoteHandlerLike {
  idToRemoteMap?: Record<string, { name?: string; expose?: string }>;
}

interface ObservabilityRuntimeInstanceLike extends ObservabilityRuntimeOrigin {
  moduleCache?:
    | Map<unknown, unknown>
    | {
        entries?: () => IterableIterator<[unknown, unknown]>;
      }
    | Record<string, unknown>;
  remoteHandler?: ObservabilityRuntimeRemoteHandlerLike;
}

interface ObservabilityReactLike {
  createElement: (
    type: unknown,
    props?: Record<string, unknown> | null,
    ...children: unknown[]
  ) => unknown;
}

interface ObservabilityCollectorOptions {
  enabled: true;
  port: number;
}

interface ObservabilityDevtoolsOptions {
  enabled: true;
  source: string;
}

type ObservabilityFetch = (
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

const DEFAULT_MAX_EVENTS = 100;
const HARD_MAX_EVENTS = 1000;
const DEFAULT_COLLECTOR_PORT = 17891;
const COLLECTOR_PATH = '/__mf_observability';
const logger = createLogger('[ Module Federation Observability Plugin ]');
const DEFAULT_DEVTOOLS_SOURCE = 'module-federation/observability';
const COMPONENT_BUSINESS_LOADED_EVENT = 'component:business-loaded';
const ON_MF_REMOTE_LOADED_PROP = 'onMFRemoteLoaded';
const SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON =
  'singleton-multiple-versions' as const;
const SENSITIVE_PAIR_PATTERN =
  /\b(token|authorization|cookie|secret|password|session|access_token|refresh_token|api_key|apikey|key)\s*[:=]\s*([^&\s'",;<>]+)/gi;
const ERROR_CODE_PATTERN = /\b(?:RUNTIME|TYPE|BUILD)-\d{3}\b/;
const URL_PATTERN = /https?:\/\/[^\s'"<>]+/g;
const DIAGNOSTIC_DOC_LINK_PATTERN =
  /https?:\/\/module-federation\.io\/guide\/troubleshooting\/[^\s'"<>]+/i;
const RUNTIME_DOC_LINK =
  'https://module-federation.io/guide/troubleshooting/runtime';
const ABSOLUTE_PATH_PATTERN =
  /(?:file:\/\/)?(?:\/(?:Users|private|var|tmp|home|workspace|opt|usr)\/[^\s)]+|[A-Za-z]:\\[^\s)]+)/g;
const MAX_METADATA_KEYS = 20;
const MAX_FACT_KEYS = 50;
const MAX_BUILD_ITEMS = 50;
const MAX_MODULE_INFO_ENTRIES = 20;
const HARD_MAX_REPORT_QUERY_LIMIT = 1000;

let traceCounter = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeMaxEvents(value: number | undefined, fallback: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(HARD_MAX_EVENTS, Math.floor(value)));
}

function normalizeQueryLimit(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(1, Math.min(HARD_MAX_REPORT_QUERY_LIMIT, Math.floor(value)));
}

function normalizeCollectorPort(value: number | undefined) {
  if (!Number.isFinite(value) || !value) {
    return DEFAULT_COLLECTOR_PORT;
  }

  const port = Math.floor(value);
  return port > 0 && port <= 65535 ? port : DEFAULT_COLLECTOR_PORT;
}

function normalizeCollectorOptions(
  value: ObservabilityPluginOptions['collector'],
): ObservabilityCollectorOptions | undefined {
  if (value === true) {
    return {
      enabled: true,
      port: DEFAULT_COLLECTOR_PORT,
    };
  }

  if (!value || value.enabled === false) {
    return undefined;
  }

  return {
    enabled: true,
    port: normalizeCollectorPort(value.port),
  };
}

function normalizeDevtoolsOptions(
  value: ObservabilityPluginOptions['devtools'],
): ObservabilityDevtoolsOptions | undefined {
  if (value === true) {
    return {
      enabled: true,
      source: DEFAULT_DEVTOOLS_SOURCE,
    };
  }

  if (!value || value.enabled === false) {
    return undefined;
  }

  return {
    enabled: true,
    source: sanitizeText(value.source, 160) || DEFAULT_DEVTOOLS_SOURCE,
  };
}

function getCollectorUrl(port: number) {
  return `http://127.0.0.1:${port}${COLLECTOR_PATH}`;
}

function sanitizeText(value: unknown, maxLength = 800): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const sanitized = String(value)
    .replace(URL_PATTERN, (url) => sanitizeUrl(url) || '[redacted-url]')
    .replace(SENSITIVE_PAIR_PATTERN, '[redacted]');

  return sanitized.length > maxLength
    ? `${sanitized.slice(0, maxLength)}...`
    : sanitized;
}

function getRawText(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value);
}

function clipText(value: unknown, maxLength = 320): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const sanitized = String(value);

  return sanitized.length > maxLength
    ? `${sanitized.slice(0, maxLength)}...`
    : sanitized;
}

function clipObservabilityMetadata(
  metadata: Record<string, unknown> | undefined,
  maxKeys = MAX_METADATA_KEYS,
): ObservabilityMetadata | undefined {
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }

  const clipped: ObservabilityMetadata = {};

  Object.entries(metadata)
    .slice(0, maxKeys)
    .forEach(([rawKey, rawValue]) => {
      const key = clipText(rawKey, 80);

      if (!key || rawValue === undefined || rawValue === null) {
        return;
      }

      if (typeof rawValue === 'boolean') {
        clipped[key] = rawValue;
        return;
      }

      if (typeof rawValue === 'number') {
        if (Number.isFinite(rawValue)) {
          clipped[key] = rawValue;
        }
        return;
      }

      const value = clipText(rawValue, 240);
      if (value) {
        clipped[key] = value;
      }
    });

  return Object.keys(clipped).length ? clipped : undefined;
}

function clipMetadata(
  metadata: Record<string, unknown> | undefined,
  maxKeys = MAX_METADATA_KEYS,
): ObservabilityMetadata | undefined {
  if (!metadata || typeof metadata !== 'object') {
    return undefined;
  }

  const clipped: ObservabilityMetadata = {};

  Object.entries(metadata)
    .slice(0, maxKeys)
    .forEach(([rawKey, rawValue]) => {
      const key = sanitizeText(rawKey, 80);

      if (!key || rawValue === undefined || rawValue === null) {
        return;
      }

      if (typeof rawValue === 'boolean') {
        clipped[key] = rawValue;
        return;
      }

      if (typeof rawValue === 'number') {
        if (Number.isFinite(rawValue)) {
          clipped[key] = rawValue;
        }
        return;
      }

      const value = clipText(rawValue, 240);
      if (value) {
        clipped[key] = value;
      }
    });

  return Object.keys(clipped).length ? clipped : undefined;
}

function sanitizeStack(
  stack: string | undefined,
  options: ObservabilityPluginOptions['stackTrace'],
): string | undefined {
  if (!stack || options?.enabled === false) {
    return undefined;
  }

  return stack;
}

function getRawStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return undefined;
}

function sanitizeRequestId(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return clipText(value, 240);
}

function sanitizeUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const base =
      typeof window !== 'undefined' && window.location
        ? window.location.origin
        : 'http://localhost';
    const parsedUrl = new URL(value, base);
    const sanitized = `${parsedUrl.origin}${parsedUrl.pathname}`;

    return /^https?:\/\//i.test(value) ? sanitized : parsedUrl.pathname;
  } catch {
    const [withoutHash] = value.split('#');
    const [withoutQuery] = withoutHash.split('?');
    return sanitizeText(withoutQuery, 240);
  }
}

function sanitizeRemote(
  remote: ObservabilityRemoteInfo | undefined,
): ObservabilityRemoteInfo | undefined {
  if (!remote || !remote.name) {
    return undefined;
  }

  return {
    name: remote.name,
    alias: sanitizeText(remote.alias, 120),
    entry: clipText(remote.entry, 320),
    entryGlobalName: sanitizeText(remote.entryGlobalName, 120),
    type: sanitizeText(remote.type, 80),
  };
}

function normalizeBridgeInfo(
  bridge: LegacyObservabilityBridgeHookArgs | undefined,
  timing: {
    startedAt: number;
    endedAt?: number;
    duration?: number;
  },
): ObservabilityBridgeInfo | undefined {
  if (!bridge?.operationId || !bridge.bridgeId) {
    return undefined;
  }

  const moduleName = sanitizeText(bridge.moduleName, 160);
  const slashIndex = moduleName?.indexOf('/') ?? -1;
  const remote =
    sanitizeText(bridge.remote, 120) ||
    (moduleName
      ? slashIndex > 0
        ? moduleName.slice(0, slashIndex)
        : moduleName
      : undefined);
  const expose =
    sanitizeText(bridge.expose, 240) ||
    (moduleName && slashIndex > 0
      ? `./${moduleName.slice(slashIndex + 1).replace(/^\.\//, '')}`
      : undefined);
  const errorInfo = getErrorInfo(bridge.error);
  return omitUndefinedFields({
    operationId: sanitizeText(bridge.operationId, 120) || bridge.operationId,
    bridgeId: sanitizeText(bridge.bridgeId, 120) || bridge.bridgeId,
    side: bridge.side,
    framework: bridge.framework,
    operation: bridge.operation,
    moduleName,
    remote,
    expose,
    route: bridge.route
      ? {
          action: sanitizeText(bridge.route.action, 80) || 'route-update',
          from: sanitizeUrl(bridge.route.from),
          to: sanitizeUrl(bridge.route.to),
          basename: sanitizeUrl(bridge.route.basename),
          mechanism: bridge.route.mechanism,
        }
      : undefined,
    reason: sanitizeText(bridge.reason, 80),
    startedAt: timing.startedAt,
    endedAt: timing.endedAt,
    duration: timing.duration,
    outcome: bridge.outcome,
    error: bridge.error
      ? {
          name: sanitizeText(errorInfo.errorName, 80),
          message: sanitizeText(errorInfo.errorMessage, 240),
        }
      : undefined,
  });
}

function sanitizeResource(
  resource: ObservabilityResourceInfo | undefined,
): ObservabilityResourceInfo | undefined {
  if (!resource) {
    return undefined;
  }

  const type = sanitizeText(resource.type, 80);
  if (!type) {
    return undefined;
  }

  return omitUndefinedFields({
    type,
    initiator: resource.initiator,
    outcome: resource.outcome,
    url: sanitizeUrl(resource.url),
    startedAt: Number.isFinite(resource.startedAt)
      ? resource.startedAt
      : Date.now(),
    endedAt:
      resource.endedAt !== undefined && Number.isFinite(resource.endedAt)
        ? resource.endedAt
        : undefined,
    duration:
      resource.duration !== undefined && Number.isFinite(resource.duration)
        ? Math.max(0, resource.duration)
        : undefined,
    httpStatus:
      resource.httpStatus !== undefined && Number.isFinite(resource.httpStatus)
        ? resource.httpStatus
        : undefined,
    mimeType: sanitizeText(resource.mimeType, 160),
    redirected:
      typeof resource.redirected === 'boolean'
        ? resource.redirected
        : undefined,
    cacheSource: sanitizeText(resource.cacheSource, 80),
    errorType: sanitizeText(resource.errorType, 80),
  });
}

function createRemoteInfo(
  remote: ObservabilityRuntimeRemoteSource | undefined,
): ObservabilityRemoteInfo | undefined {
  if (!remote?.name) {
    return undefined;
  }

  return {
    name: remote.name,
    alias: remote.alias,
    entry: remote.entry,
    entryGlobalName: remote.entryGlobalName,
    type: remote.type,
  };
}

function isManifestUrl(value: string | undefined): boolean {
  const sanitized = sanitizeUrl(value);

  return Boolean(sanitized && /manifest.*\.json$/i.test(sanitized));
}

function normalizeSharedScope(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value])
    .map((scope) => sanitizeText(scope, 120))
    .filter((scope): scope is string => Boolean(scope));
}

function getSharedScopes(
  shareInfo: ObservabilityRuntimeSharedSource | undefined,
): string[] {
  return normalizeSharedScope(shareInfo?.scope).length
    ? normalizeSharedScope(shareInfo?.scope)
    : ['default'];
}

function getAvailableSharedVersions(args: ObservabilitySharedLifecycleArgs) {
  const versions = new Set<string>();
  const shareScopeMap = args.shareScopeMap || {};

  getSharedScopes(args.shareInfo).forEach((scope) => {
    Object.keys(shareScopeMap[scope]?.[args.pkgName] || {}).forEach(
      (version) => {
        versions.add(version);
      },
    );
  });

  return Array.from(versions);
}

function getOriginShareScopeMap(
  origin: ObservabilityRuntimeOrigin,
): ObservabilityRuntimeShareScopeMap {
  return origin.shareScopeMap || origin.sharedHandler?.shareScopeMap || {};
}

function getSharedVersion(value: ObservabilityRuntimeSharedSource | undefined) {
  return sanitizeText(value?.version, 120);
}

function isSingletonShared(
  value: ObservabilityRuntimeSharedSource | undefined,
) {
  return value?.shareConfig?.singleton === true;
}

function createSharedConflictVersion(
  version: string,
  shared: ObservabilityRuntimeSharedSource | undefined,
): ObservabilitySharedConflictVersion {
  return {
    version,
    from: sanitizeText(shared?.from, 160),
    singleton: isSingletonShared(shared) || undefined,
    loaded: shared?.loaded === true || undefined,
  };
}

function createSharedSingletonConflict(args: {
  pkgName: string;
  shared: ObservabilityRuntimeSharedSource;
  scope: string;
  shareScopeMap: ObservabilityRuntimeShareScopeMap;
}): ObservabilitySharedConflictInfo | undefined {
  const currentVersion = getSharedVersion(args.shared);
  if (!currentVersion) {
    return undefined;
  }

  const existingVersionMap =
    args.shareScopeMap[args.scope]?.[args.pkgName] || {};
  const existingVersions = Object.entries(existingVersionMap)
    .map(([version, shared]) =>
      createSharedConflictVersion(
        sanitizeText(version, 120) || version,
        shared,
      ),
    )
    .filter((item) => item.version && item.version !== currentVersion);

  if (!existingVersions.length) {
    return undefined;
  }

  const hasSingleton =
    isSingletonShared(args.shared) ||
    existingVersions.some((item) => item.singleton === true);

  if (!hasSingleton) {
    return undefined;
  }

  const versions = Array.from(
    new Set([currentVersion, ...existingVersions.map((item) => item.version)]),
  ).sort();

  if (versions.length <= 1) {
    return undefined;
  }

  return {
    reason: SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON,
    scope: args.scope,
    currentVersion,
    currentFrom: sanitizeText(args.shared.from, 160),
    versions,
    existingVersions,
  };
}

function createSharedConflictInfo(args: {
  pkgName: string;
  shared: ObservabilityRuntimeSharedSource;
  conflict: ObservabilitySharedConflictInfo;
}): ObservabilitySharedInfo {
  const shareConfig = args.shared.shareConfig;

  return {
    name: args.pkgName,
    shareScope: [args.conflict.scope],
    version: args.conflict.currentVersion || args.shared.version,
    requiredVersion: shareConfig?.requiredVersion,
    availableVersions: args.conflict.versions,
    provider: args.conflict.currentFrom,
    useIn: args.shared.useIn,
    singleton: true,
    strictVersion: shareConfig?.strictVersion,
    eager: shareConfig?.eager,
    strategy: args.shared.strategy,
    loaded: args.shared.loaded,
    loading: args.shared.loaded
      ? undefined
      : Boolean(args.shared.loading) || undefined,
    reason: SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON,
    conflict: args.conflict,
  };
}

function getSharedConflictKey(args: {
  hostName?: string;
  pkgName: string;
  conflict: ObservabilitySharedConflictInfo;
}) {
  return [
    args.hostName || 'unknown',
    args.pkgName,
    args.conflict.scope,
    args.conflict.versions.join(','),
  ].join('|');
}

function getSharedUseIn(args: ObservabilitySharedLifecycleArgs) {
  const useIn = [
    ...(args.selectedShared?.useIn || []),
    ...(args.shareInfo?.useIn || []),
    args.origin.options?.name || args.origin.name,
  ]
    .map((consumer) => sanitizeText(consumer, 160))
    .filter((consumer): consumer is string => Boolean(consumer));

  return Array.from(new Set(useIn));
}

function getSharedMissReason(args: ObservabilitySharedLifecycleArgs) {
  if (!args.shareInfo) {
    return 'missing-config';
  }

  return getAvailableSharedVersions(args).length
    ? 'version-mismatch'
    : 'missing-provider';
}

function getSharedErrorReason(args: ObservabilitySharedLifecycleArgs) {
  if (args.recovered) {
    return getSharedMissReason(args);
  }

  const errorInfo = getErrorInfo(args.error, { enabled: false });
  const errorMessage = errorInfo.errorMessage || '';

  if (!args.shareInfo || /Cannot find shared/i.test(errorMessage)) {
    return 'missing-config';
  }

  if (
    args.lifecycle === 'loadShareSync' &&
    typeof args.shareInfo.get === 'function' &&
    /RUNTIME-00[56]/.test(errorMessage)
  ) {
    return 'sync-async-boundary';
  }

  if (
    args.lifecycle === 'loadShareSync' &&
    !args.shareInfo.get &&
    /RUNTIME-006/.test(errorMessage)
  ) {
    return getSharedMissReason(args);
  }

  if (args.error) {
    return 'load-error';
  }

  return undefined;
}

function parseStableVersion(version?: string) {
  const matched = version?.match(/^(\d+)\.(\d+)\.(\d+)(?:\+[\w.-]+)?$/);

  if (!matched) {
    return undefined;
  }

  return {
    major: Number(matched[1]),
    minor: Number(matched[2]),
    patch: Number(matched[3]),
  };
}

function isVersionAtLeast(
  version: { major: number; minor: number; patch: number },
  target: { major: number; minor: number; patch: number },
) {
  if (version.major !== target.major) {
    return version.major > target.major;
  }

  if (version.minor !== target.minor) {
    return version.minor > target.minor;
  }

  return version.patch >= target.patch;
}

function supportsRuntimeObservability(origin?: ObservabilityRuntimeOrigin) {
  const version = parseStableVersion(origin?.version);

  if (!version) {
    return false;
  }

  return isVersionAtLeast(version, {
    major: 2,
    minor: 5,
    patch: 0,
  });
}

function isRuntimeSharedLoaded(shared?: ObservabilityRuntimeSharedSource) {
  return (
    shared?.loaded === true ||
    shared?.treeShaking?.loaded === true ||
    (typeof shared?.get === 'function' && shared.loaded === true)
  );
}

function isRuntimeSharedLoading(shared?: ObservabilityRuntimeSharedSource) {
  return (
    !isRuntimeSharedLoaded(shared) &&
    Boolean(shared?.loading || shared?.treeShaking?.loading)
  );
}

function getRuntimeSharedCompatibility(
  version: string,
  requiredVersion?: string | false,
) {
  if (requiredVersion === undefined) {
    return undefined;
  }
  if (requiredVersion === false || requiredVersion === '*') {
    return true;
  }
  try {
    return satisfy(version, requiredVersion);
  } catch {
    return false;
  }
}

function createRuntimeSharedCandidate(
  scope: string,
  version: string,
  shared: ObservabilityRuntimeSharedSource,
  requiredVersion?: string | false,
): ObservabilityRuntimeSharedCandidate {
  const compatible = getRuntimeSharedCompatibility(version, requiredVersion);
  return {
    scope,
    version,
    provider: shared.from,
    loaded: isRuntimeSharedLoaded(shared),
    loading: isRuntimeSharedLoading(shared),
    singleton: shared.shareConfig?.singleton === true,
    eager: shared.shareConfig?.eager === true,
    strategy: shared.strategy,
    compatible,
    rejectionReason: compatible === false ? 'version-mismatch' : undefined,
  };
}

function getRuntimeSharedCandidates(args: {
  shareScopeMap?: ObservabilityRuntimeShareScopeMap;
  scope: string;
  pkgName: string;
  requiredVersion?: string | false;
}) {
  return Object.entries(args.shareScopeMap?.[args.scope]?.[args.pkgName] || {})
    .filter(
      (entry): entry is [string, ObservabilityRuntimeSharedSource] =>
        entry[1] !== undefined,
    )
    .map(([version, shared]) =>
      createRuntimeSharedCandidate(
        args.scope,
        version,
        shared,
        args.requiredVersion,
      ),
    );
}

function createRuntimeSharedSelection(
  args: ObservabilitySharedResolveArgs,
  selectedShared: ObservabilityRuntimeSharedSource | undefined,
  selectionError?: unknown,
): ObservabilityRuntimeSharedSelectionResult {
  const requiredVersion = args.shareInfo.shareConfig?.requiredVersion;
  const candidates = getRuntimeSharedCandidates({
    shareScopeMap: args.shareScopeMap,
    scope: args.scope,
    pkgName: args.pkgName,
    requiredVersion,
  });
  const selectedVersion = selectedShared?.version;
  const selected =
    selectedShared && selectedVersion
      ? createRuntimeSharedCandidate(
          args.scope,
          selectedVersion,
          selectedShared,
          requiredVersion,
        )
      : undefined;

  let reason: string;
  let failureReason: string | undefined;
  if (selectionError) {
    const strictVersionRejected =
      args.shareInfo.shareConfig?.singleton === true &&
      args.shareInfo.shareConfig?.strictVersion === true &&
      typeof requiredVersion === 'string' &&
      getRuntimeSharedCompatibility(args.version, requiredVersion) === false;
    reason = strictVersionRejected ? 'strict-version-rejected' : 'load-error';
    failureReason = reason;
  } else if (!selected) {
    reason = candidates.length ? 'version-mismatch' : 'missing-provider';
    failureReason = reason;
  } else if (args.loadContext?.customResolver) {
    reason = 'custom-resolver';
  } else if (args.shareInfo.shareConfig?.singleton) {
    reason = 'singleton-existing';
  } else if (
    args.shareInfo.strategy === 'loaded-first' &&
    (selected.loaded || selected.loading)
  ) {
    reason = 'loaded-first';
  } else if (selected.version === args.shareInfo.version) {
    reason = 'exact-match';
  } else if (requiredVersion === false || requiredVersion === '*') {
    reason =
      args.shareInfo.strategy === 'loaded-first'
        ? 'loaded-first'
        : 'version-first';
  } else if (selected.version === args.version) {
    reason = 'compatible-highest-version';
  } else {
    reason = 'compatible-version';
  }

  const candidatesWithReasons = candidates.map((candidate) => {
    if (
      selected &&
      candidate.scope === selected.scope &&
      candidate.version === selected.version &&
      candidate.provider === selected.provider
    ) {
      return { ...candidate, rejectionReason: undefined };
    }
    if (candidate.rejectionReason) {
      return candidate;
    }
    if (!selected) {
      return candidate;
    }
    if (reason === 'custom-resolver') {
      return { ...candidate, rejectionReason: 'custom-resolver' };
    }
    if (reason === 'singleton-existing') {
      return { ...candidate, rejectionReason: 'singleton-existing' };
    }
    if (reason === 'loaded-first' && !candidate.loaded && !candidate.loading) {
      return { ...candidate, rejectionReason: 'not-loaded' };
    }
    return { ...candidate, rejectionReason: 'lower-priority-version' };
  });

  return {
    scope: args.scope,
    requestedVersion: args.shareInfo.version,
    requiredVersion,
    singleton: args.shareInfo.shareConfig?.singleton,
    strictVersion: args.shareInfo.shareConfig?.strictVersion,
    eager: args.shareInfo.shareConfig?.eager,
    strategy: args.shareInfo.strategy,
    candidates: candidatesWithReasons,
    selected,
    reason,
    failureReason,
    context: args.loadContext,
  };
}

function createSharedCandidate(
  candidate: ObservabilityRuntimeSharedCandidate,
): ObservabilitySharedCandidate {
  return {
    scope: candidate.scope,
    version: candidate.version,
    provider: candidate.provider,
    loaded: candidate.loaded === true,
    loading: candidate.loading === true,
    singleton: candidate.singleton === true,
    eager: candidate.eager === true,
    strategy: candidate.strategy,
    compatible: candidate.compatible,
    rejectionReason: candidate.rejectionReason,
  };
}

function createSharedInfo(
  args: ObservabilitySharedLifecycleArgs,
  reason?: string,
  selection?: ObservabilityRuntimeSharedSelectionResult,
): ObservabilitySharedInfo {
  const shareConfig = args.shareInfo?.shareConfig;
  const selected = selection?.selected;
  const context = selection?.context || args.loadContext;
  const handledBundlerRuntimeShared = reason === 'custom-share-info-unmatched';
  const loaded = selected?.loaded ?? args.selectedShared?.loaded;
  const candidates = selection?.candidates?.map(createSharedCandidate);

  return {
    name: args.pkgName,
    shareScope: selection?.scope
      ? [selection.scope]
      : getSharedScopes(args.shareInfo),
    version:
      selection?.requestedVersion ||
      args.selectedShared?.version ||
      args.shareInfo?.version,
    requiredVersion: selection?.requiredVersion ?? shareConfig?.requiredVersion,
    selectedVersion: selected?.version || args.selectedShared?.version,
    availableVersions: candidates?.length
      ? Array.from(new Set(candidates.map((candidate) => candidate.version)))
      : getAvailableSharedVersions(args),
    provider: selected?.provider || args.selectedShared?.from,
    useIn: getSharedUseIn(args),
    singleton: selection?.singleton ?? shareConfig?.singleton,
    strictVersion: selection?.strictVersion ?? shareConfig?.strictVersion,
    eager: selection?.eager ?? shareConfig?.eager,
    strategy: selection?.strategy || args.shareInfo?.strategy,
    loaded,
    loading: loaded
      ? undefined
      : selected?.loading || Boolean(args.selectedShared?.loading) || undefined,
    reason,
    selectionReason: selection?.reason,
    failureReason: selection?.failureReason,
    candidates,
    loadType: selection?.loadType,
    trigger: context?.trigger,
    moduleId: context?.moduleId,
    chunkId: context?.chunkId,
    remote: context?.remote,
    expose: context?.expose,
    requestId: context?.requestId,
    operationId: context?.operationId,
    fallback: selection?.fallback,
    recovered: selection?.recovered ?? args.recovered,
    definedBy: handledBundlerRuntimeShared ? 'bundler-runtime' : undefined,
  };
}

function createSharedRegistrationInfo(
  args: ObservabilitySharedRegistrationArgs,
  registrationId: string,
): ObservabilitySharedInfo {
  const candidateSource = args.shared;
  const effectiveSource = args.registeredShared;
  const requiredVersion = candidateSource.shareConfig?.requiredVersion;
  const candidate = createSharedCandidate(
    createRuntimeSharedCandidate(
      args.scope,
      candidateSource.version || '0',
      candidateSource,
      requiredVersion,
    ),
  );
  const effective = effectiveSource
    ? createSharedCandidate(
        createRuntimeSharedCandidate(
          args.scope,
          effectiveSource.version || '0',
          effectiveSource,
          requiredVersion,
        ),
      )
    : undefined;
  const candidates = getRuntimeSharedCandidates({
    shareScopeMap: args.shareScopeMap,
    scope: args.scope,
    pkgName: args.pkgName,
    requiredVersion,
  });
  const previous = args.previousShared;
  let action: ObservabilitySharedRegistration['action'];
  let reason: string;
  if (previous === candidateSource) {
    action = 'reused';
    reason = 'same-registration-reused';
  } else if (!previous && effectiveSource) {
    action = 'registered';
    reason = 'first-registration';
  } else if (previous && effectiveSource !== previous) {
    action = 'replaced';
    reason =
      candidate.eager && previous.shareConfig?.eager !== true
        ? 'eager-preferred'
        : 'provider-name-preferred';
  } else {
    action = 'ignored';
    reason =
      previous?.strategy === 'loaded-first'
        ? 'loaded-first-preserved'
        : previous?.loaded
          ? 'loaded-version-preserved'
          : previous?.shareConfig?.eager && !candidate.eager
            ? 'eager-provider-preserved'
            : 'provider-name-preserved';
  }

  return {
    name: args.pkgName,
    shareScope: [args.scope],
    version: candidate.version,
    selectedVersion: effective?.version,
    availableVersions: Array.from(
      new Set(candidates.map((item) => item.version)),
    ),
    provider: effective?.provider,
    singleton: candidate.singleton,
    eager: candidate.eager,
    strategy: candidate.strategy,
    loaded: effective?.loaded,
    loading: effective?.loading || undefined,
    candidates: candidates.map(createSharedCandidate),
    trigger: args.trigger,
    registration: {
      registrationId,
      action,
      reason,
      trigger: args.trigger,
      scope: args.scope,
      candidate,
      effective,
    },
  };
}

function getSharedOperationId(args: ObservabilitySharedLifecycleArgs) {
  return args.loadContext?.operationId || `shared:${args.pkgName}`;
}

function sanitizeSharedCandidate(
  candidate: ObservabilitySharedCandidate,
): ObservabilitySharedCandidate | undefined {
  const scope = sanitizeText(candidate.scope, 120);
  const version = sanitizeText(candidate.version, 120);
  if (!scope || !version) {
    return undefined;
  }
  return {
    scope,
    version,
    provider: sanitizeText(candidate.provider, 160),
    loaded: candidate.loaded === true,
    loading: candidate.loading === true,
    singleton: candidate.singleton === true,
    eager: candidate.eager === true,
    strategy: sanitizeText(candidate.strategy, 80),
    compatible: candidate.compatible,
    rejectionReason: sanitizeText(candidate.rejectionReason, 120),
  };
}

function sanitizeSharedRegistration(
  registration: ObservabilitySharedRegistration | undefined,
): ObservabilitySharedRegistration | undefined {
  if (!registration) {
    return undefined;
  }
  const candidate = sanitizeSharedCandidate(registration.candidate);
  const effective = registration.effective
    ? sanitizeSharedCandidate(registration.effective)
    : undefined;
  const registrationId = sanitizeText(registration.registrationId, 120);
  const scope = sanitizeText(registration.scope, 120);
  const trigger = sanitizeText(registration.trigger, 80);
  const reason = sanitizeText(registration.reason, 120);
  if (!candidate || !registrationId || !scope || !trigger || !reason) {
    return undefined;
  }
  return {
    registrationId,
    action: registration.action,
    reason,
    trigger,
    scope,
    candidate,
    effective,
  };
}

function sanitizeShared(
  shared: ObservabilitySharedInfo | undefined,
): ObservabilitySharedInfo | undefined {
  if (!shared || !shared.name) {
    return undefined;
  }

  return {
    name: sanitizeText(shared.name, 160) || 'unknown',
    shareScope: normalizeSharedScope(shared.shareScope),
    version: sanitizeText(shared.version, 120),
    requiredVersion:
      shared.requiredVersion === false
        ? false
        : sanitizeText(shared.requiredVersion, 120),
    selectedVersion: sanitizeText(shared.selectedVersion, 120),
    availableVersions: (shared.availableVersions || [])
      .map((version) => sanitizeText(version, 120))
      .filter((version): version is string => Boolean(version))
      .slice(0, 20),
    provider: sanitizeText(shared.provider, 160),
    useIn: (shared.useIn || [])
      .map((consumer) => sanitizeText(consumer, 160))
      .filter((consumer): consumer is string => Boolean(consumer)),
    singleton: shared.singleton,
    strictVersion: shared.strictVersion,
    eager: shared.eager,
    strategy: sanitizeText(shared.strategy, 80),
    loaded: shared.loaded,
    loading: shared.loading,
    reason: sanitizeText(shared.reason, 120),
    definedBy:
      shared.definedBy === 'bundler-runtime' ? 'bundler-runtime' : undefined,
    conflict: sanitizeSharedConflict(shared.conflict),
    candidates: (shared.candidates || [])
      .map(sanitizeSharedCandidate)
      .filter(
        (candidate): candidate is ObservabilitySharedCandidate =>
          candidate !== undefined,
      )
      .slice(0, 20),
    selectionReason: sanitizeText(shared.selectionReason, 120),
    failureReason: sanitizeText(shared.failureReason, 120),
    loadType:
      shared.loadType === 'sync' || shared.loadType === 'async'
        ? shared.loadType
        : undefined,
    trigger: sanitizeText(shared.trigger, 80),
    moduleId:
      typeof shared.moduleId === 'number'
        ? shared.moduleId
        : sanitizeText(shared.moduleId, 160),
    chunkId:
      typeof shared.chunkId === 'number'
        ? shared.chunkId
        : sanitizeText(shared.chunkId, 160),
    remote: sanitizeText(shared.remote, 160),
    expose: sanitizeText(shared.expose, 240),
    requestId: sanitizeText(shared.requestId, 240),
    operationId: sanitizeText(shared.operationId, 160),
    fallback: shared.fallback === true || undefined,
    recovered: shared.recovered === true || undefined,
    registration: sanitizeSharedRegistration(shared.registration),
  };
}

function sanitizeSharedConflict(
  conflict: ObservabilitySharedConflictInfo | undefined,
): ObservabilitySharedConflictInfo | undefined {
  if (!conflict) {
    return undefined;
  }

  const scope = sanitizeText(conflict.scope, 120) || 'default';
  const versions = (conflict.versions || [])
    .map((version) => sanitizeText(version, 120))
    .filter((version): version is string => Boolean(version))
    .slice(0, 20);
  const existingVersions = (conflict.existingVersions || [])
    .map((item) => ({
      version: sanitizeText(item.version, 120),
      from: sanitizeText(item.from, 160),
      singleton: item.singleton === true || undefined,
      loaded: item.loaded === true || undefined,
    }))
    .filter(
      (item): item is ObservabilitySharedConflictVersion =>
        typeof item.version === 'string' && item.version.length > 0,
    )
    .slice(0, 20);

  return {
    reason: SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON,
    scope,
    currentVersion: sanitizeText(conflict.currentVersion, 120),
    currentFrom: sanitizeText(conflict.currentFrom, 160),
    versions,
    existingVersions,
  };
}

function getObjectValue(value: Record<string, unknown>, key: string) {
  return value[key];
}

function isReactLike(value: unknown): value is ObservabilityReactLike {
  if (!isRecord(value)) {
    return false;
  }

  return typeof getObjectValue(value, 'createElement') === 'function';
}

function resolveReactLike(value: unknown): ObservabilityReactLike | undefined {
  if (isReactLike(value)) {
    return value;
  }

  if (isRecord(value)) {
    const defaultExport = getObjectValue(value, 'default');
    if (isReactLike(defaultExport)) {
      return defaultExport;
    }
  }

  return undefined;
}

function getReactComponentName(component: unknown, fallback: string) {
  if (typeof component === 'function') {
    const displayName = (component as { displayName?: string }).displayName;
    return displayName || component.name || fallback;
  }

  if (!isRecord(component)) {
    return fallback;
  }

  const displayName = getObjectValue(component, 'displayName');
  if (typeof displayName === 'string' && displayName) {
    return displayName;
  }

  const render = getObjectValue(component, 'render');
  if (typeof render === 'function') {
    const renderFunction = render as { displayName?: string; name?: string };
    return renderFunction.displayName || renderFunction.name || fallback;
  }

  return fallback;
}

function isLikelyReactFunctionComponent(
  component: unknown,
  allowAnonymousComponent = false,
) {
  if (typeof component !== 'function') {
    return false;
  }

  const name =
    (component as { displayName?: string }).displayName || component.name || '';
  if (/^use[A-Z0-9]/.test(name)) {
    return false;
  }

  if (allowAnonymousComponent) {
    return true;
  }

  if (!name) {
    return false;
  }

  return /^[A-Z]/.test(name);
}

function copyComponentStatics(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
) {
  const reserved = new Set([
    'arguments',
    'caller',
    'length',
    'name',
    'prototype',
    'displayName',
  ]);

  Object.getOwnPropertyNames(source).forEach((key) => {
    if (reserved.has(key)) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    if (!descriptor || !descriptor.configurable) {
      return;
    }

    try {
      Object.defineProperty(target, key, descriptor);
    } catch {
      // Static metadata is best effort and must not affect remote rendering.
    }
  });
}

function cloneModuleWithDefaultExport(
  moduleExports: Record<string, unknown>,
  defaultExport: unknown,
) {
  const descriptors = Object.getOwnPropertyDescriptors(moduleExports);
  const defaultDescriptor = descriptors['default'];

  descriptors['default'] = {
    configurable: true,
    enumerable: defaultDescriptor?.enumerable ?? true,
    writable: true,
    value: defaultExport,
  };

  return Object.defineProperties(
    Object.create(Object.getPrototypeOf(moduleExports)),
    descriptors,
  );
}

function resolveReactComponentTarget(
  component: unknown,
  defaultExportMode: 'preserve' | 'component' = 'preserve',
  allowAnonymousComponent = false,
):
  | {
      component: unknown;
      createResult: (wrappedComponent: unknown) => unknown;
    }
  | undefined {
  if (isLikelyReactFunctionComponent(component, allowAnonymousComponent)) {
    return {
      component,
      createResult: (wrappedComponent) => wrappedComponent,
    };
  }

  if (!isRecord(component)) {
    return undefined;
  }

  const defaultExport = getObjectValue(component, 'default');
  if (!isLikelyReactFunctionComponent(defaultExport, allowAnonymousComponent)) {
    return undefined;
  }

  return {
    component: defaultExport,
    createResult: (wrappedComponent) => {
      const descriptor = Object.getOwnPropertyDescriptor(component, 'default');
      let defaultExportReplaced = false;

      try {
        if (!descriptor || descriptor.writable || descriptor.set) {
          component['default'] = wrappedComponent;
          defaultExportReplaced = true;
        } else if (descriptor.configurable) {
          Object.defineProperty(component, 'default', {
            configurable: true,
            enumerable: descriptor.enumerable,
            writable: true,
            value: wrappedComponent,
          });
          defaultExportReplaced = true;
        }
      } catch {
        // If the module namespace is read-only, leave the remote module untouched.
      }

      if (defaultExportMode === 'component') {
        return wrappedComponent;
      }

      return defaultExportReplaced
        ? undefined
        : cloneModuleWithDefaultExport(component, wrappedComponent);
    },
  };
}

function normalizeEventSource(
  value: ObservabilityEventSource | undefined,
): ObservabilityEventSource | undefined {
  return value === 'runtime' || value === 'business' || value === 'react'
    ? value
    : undefined;
}

function extractErrorCode(value: unknown): string | undefined {
  const matched = String(value ?? '').match(ERROR_CODE_PATTERN)?.[0];
  return matched ? sanitizeText(matched, 40) : undefined;
}

function getErrorInfo(
  error: unknown,
  stackTraceOptions?: ObservabilityPluginOptions['stackTrace'],
): {
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  errorStack?: string;
} {
  if (!error) {
    return {};
  }

  if (error instanceof Error) {
    return {
      errorCode: extractErrorCode(
        `${error.name}\n${error.message}\n${error.stack || ''}`,
      ),
      errorName: getRawText(error.name),
      errorMessage: getRawText(error.message),
      errorStack: sanitizeStack(error.stack, stackTraceOptions),
    };
  }

  if (isRecord(error) && typeof error.message === 'string') {
    return {
      errorCode: extractErrorCode(error.message),
      errorName:
        typeof error.name === 'string' ? getRawText(error.name) : undefined,
      errorMessage: getRawText(error.message),
    };
  }

  return {
    errorCode: extractErrorCode(error),
    errorMessage: getRawText(error),
  };
}

function classifyResourceLoadError(
  resource: ObservabilityResourceLoadResultArgs,
): string | undefined {
  if (resource.outcome === 'timeout') {
    return 'timeout';
  }

  if (typeof resource.httpStatus === 'number' && resource.httpStatus >= 400) {
    return 'http';
  }

  const errorInfo = getErrorInfo(resource.error);
  const value =
    `${errorInfo.errorName || ''} ${errorInfo.errorMessage || ''}`.trim();
  if (!value) {
    return resource.outcome === 'error' ? 'unknown' : undefined;
  }

  if (/timeout|timed out/i.test(value)) {
    return 'timeout';
  }

  if (/ScriptExecutionError/i.test(value)) {
    return 'execution';
  }

  if (
    /ScriptNetworkError|LinkNetworkError|NetworkError|Failed to fetch|Request failed|ERR_|CORS|ENOENT|unreachable/i.test(
      value,
    )
  ) {
    return 'network';
  }

  if (/RUNTIME-001|global.+not found|not found.+global/i.test(value)) {
    return 'initialization';
  }

  if (
    errorInfo.errorName === 'SyntaxError' ||
    /valid federation manifest|JSON|Unexpected token/i.test(value)
  ) {
    return 'content';
  }

  return resource.outcome === 'error' ? 'unknown' : undefined;
}

function omitUndefinedFields<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => omitUndefinedFields(item)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const cleanValue: Record<string, unknown> = {};

  Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
    if (item === undefined) {
      return;
    }

    cleanValue[key] = omitUndefinedFields(item);
  });

  return cleanValue as T;
}

function copyEvent(event: ObservabilityEvent): ObservabilityEvent {
  return omitUndefinedFields({
    ...event,
    remote: event.remote ? { ...event.remote } : undefined,
    resource: event.resource ? { ...event.resource } : undefined,
    shared: event.shared
      ? {
          ...event.shared,
          shareScope: event.shared.shareScope
            ? [...event.shared.shareScope]
            : undefined,
          availableVersions: event.shared.availableVersions
            ? [...event.shared.availableVersions]
            : undefined,
          conflict: copySharedConflict(event.shared.conflict),
        }
      : undefined,
    errorContext: event.errorContext ? { ...event.errorContext } : undefined,
    metadata: event.metadata ? { ...event.metadata } : undefined,
    loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
    bridge: copyBridgeInfo(event.bridge),
  });
}

function copyBridgeInfo(
  bridge: ObservabilityBridgeInfo | undefined,
): ObservabilityBridgeInfo | undefined {
  if (!bridge) {
    return undefined;
  }

  return omitUndefinedFields({
    ...bridge,
    route: bridge.route ? { ...bridge.route } : undefined,
    error: bridge.error ? { ...bridge.error } : undefined,
  });
}

function copySharedConflict(
  conflict: ObservabilitySharedConflictInfo | undefined,
): ObservabilitySharedConflictInfo | undefined {
  if (!conflict) {
    return undefined;
  }

  return {
    ...conflict,
    versions: [...conflict.versions],
    existingVersions: conflict.existingVersions.map((item) => ({ ...item })),
  };
}

function copySummary(
  summary: ObservabilityReport['summary'],
): ObservabilityReport['summary'] {
  return {
    ...summary,
    phases: Object.entries(summary.phases).reduce<
      Record<string, ObservabilityPhaseSummary>
    >((memo, [phase, phaseSummary]) => {
      memo[phase] = { ...phaseSummary };
      return memo;
    }, {}),
    shared: summary.shared
      ? {
          ...summary.shared,
          shareScope: summary.shared.shareScope
            ? [...summary.shared.shareScope]
            : undefined,
        }
      : undefined,
    flags: { ...summary.flags },
    error: summary.error
      ? {
          ...summary.error,
          context: summary.error.context
            ? { ...summary.error.context }
            : undefined,
        }
      : undefined,
  };
}

function copyFactReport(
  diagnosis: ObservabilityFactReport | undefined,
): ObservabilityFactReport | undefined {
  if (!diagnosis) {
    return undefined;
  }

  return {
    ...diagnosis,
    facts: { ...diagnosis.facts },
    completedPhases: [...diagnosis.completedPhases],
    pendingPhases: [...diagnosis.pendingPhases],
    warnings: diagnosis.warnings ? [...diagnosis.warnings] : undefined,
    actions: diagnosis.actions.map((action) => ({ ...action })),
  };
}

function copyModuleInfoSummary(
  moduleInfo: ObservabilityModuleInfoSummary | undefined,
): ObservabilityModuleInfoSummary | undefined {
  if (!moduleInfo) {
    return undefined;
  }

  return {
    ...moduleInfo,
    entries: moduleInfo.entries.map((entry) => ({ ...entry })),
    availableNames: moduleInfo.availableNames
      ? [...moduleInfo.availableNames]
      : undefined,
  };
}

function copyLoadedBeforeInfo(
  loadedBefore: ObservabilityLoadedBeforeInfo | undefined,
): ObservabilityLoadedBeforeInfo | undefined {
  if (!loadedBefore) {
    return undefined;
  }

  return {
    producer: loadedBefore.producer,
    expose: loadedBefore.expose,
    consumers: loadedBefore.consumers.map((consumer) => ({
      ...consumer,
      exposes: consumer.exposes ? [...consumer.exposes] : undefined,
    })),
  };
}

function copyReport(report: ObservabilityReport): ObservabilityReport {
  return omitUndefinedFields({
    ...report,
    remote: report.remote ? { ...report.remote } : undefined,
    shared: report.shared
      ? {
          ...report.shared,
          shareScope: report.shared.shareScope
            ? [...report.shared.shareScope]
            : undefined,
          availableVersions: report.shared.availableVersions
            ? [...report.shared.availableVersions]
            : undefined,
          conflict: copySharedConflict(report.shared.conflict),
        }
      : undefined,
    errorContext: report.errorContext ? { ...report.errorContext } : undefined,
    moduleInfo: copyModuleInfoSummary(report.moduleInfo),
    loadedBefore: copyLoadedBeforeInfo(report.loadedBefore),
    bridge: copyBridgeInfo(report.bridge),
    events: report.events.map(copyEvent),
    summary: copySummary(report.summary),
    diagnosis: copyFactReport(report.diagnosis),
  });
}

function getFederationGlobal(): FederationObservabilityGlobal | undefined {
  return (
    globalThis as {
      __FEDERATION__?: FederationObservabilityGlobal;
    }
  ).__FEDERATION__;
}

function normalizeExposeName(value: unknown): string | undefined {
  const sanitized = sanitizeText(value, 240);
  if (!sanitized) {
    return undefined;
  }

  return sanitized.replace(/^\.\//, '');
}

function getModuleCacheEntries(
  moduleCache: ObservabilityRuntimeInstanceLike['moduleCache'],
): unknown[] {
  if (!moduleCache) {
    return [];
  }

  if (moduleCache instanceof Map) {
    return Array.from(moduleCache.values());
  }

  const entries =
    typeof moduleCache.entries === 'function'
      ? Array.from(
          moduleCache.entries.call(moduleCache) as Iterable<[unknown, unknown]>,
        )
      : undefined;

  if (entries) {
    return entries.map(([, value]) => value);
  }

  if (isRecord(moduleCache)) {
    return Object.values(moduleCache);
  }

  return [];
}

function getLoadedExposesForRemote(
  instance: ObservabilityRuntimeInstanceLike,
  remoteName: string | undefined,
) {
  if (!remoteName) {
    return [];
  }

  return Array.from(
    new Set(
      Object.values(instance.remoteHandler?.idToRemoteMap || {})
        .filter((item) => item?.name === remoteName)
        .map((item) => sanitizeText(item.expose, 240))
        .filter((expose): expose is string => Boolean(expose)),
    ),
  );
}

function collectLoadedBeforeInfo(
  remote: ObservabilityRemoteInfo | undefined,
  expose: string | undefined,
  origin?: ObservabilityRuntimeOrigin,
): ObservabilityLoadedBeforeInfo | undefined {
  const entryGlobalName = remote?.entryGlobalName;
  if (!entryGlobalName) {
    return undefined;
  }

  const federation = getFederationGlobal();
  const instances = Array.isArray(federation?.__INSTANCES__)
    ? federation.__INSTANCES__
    : [];
  const targetExpose = normalizeExposeName(expose);
  const consumers: ObservabilityLoadedBeforeConsumer[] = [];

  instances.forEach((instance) => {
    if (instance === origin) {
      return;
    }

    const matchedModule = getModuleCacheEntries(instance.moduleCache).find(
      (item): item is ObservabilityRuntimeModuleLike =>
        isRuntimeModuleWithEntryGlobalName(item, entryGlobalName),
    );

    if (!matchedModule) {
      return;
    }

    const exposes = getLoadedExposesForRemote(
      instance,
      matchedModule.remoteInfo?.name,
    );
    const consumer: ObservabilityLoadedBeforeConsumer = {
      name:
        sanitizeText(instance.options?.name, 120) ||
        sanitizeText(instance.name, 120),
      remoteEntryExports: Boolean(matchedModule.remoteEntryExports),
      containerInitialized: matchedModule.inited === true,
      exposes: exposes.length ? exposes : undefined,
    };

    consumers.push(omitUndefinedFields(consumer));
  });

  if (!consumers.length) {
    return undefined;
  }

  const exposeLoadedBefore = targetExpose
    ? consumers.some((consumer) =>
        (consumer.exposes || []).some(
          (loadedExpose) => normalizeExposeName(loadedExpose) === targetExpose,
        ),
      )
    : false;

  return {
    producer: true,
    expose: exposeLoadedBefore,
    consumers,
  };
}

function isRuntimeModuleWithEntryGlobalName(
  value: unknown,
  entryGlobalName: string,
): value is ObservabilityRuntimeModuleLike {
  if (!isRecord(value)) {
    return false;
  }

  const remoteInfo = getObjectValue(value, 'remoteInfo');
  return (
    isRecord(remoteInfo) &&
    getObjectValue(remoteInfo, 'entryGlobalName') === entryGlobalName
  );
}

function normalizeScope(value: unknown) {
  const sanitized = sanitizeText(value, 120);
  const normalized = sanitized?.replace(/[^\w:@.-]+/g, '-');

  return normalized || 'default';
}

function shouldRecordEvent(
  level: ObservabilityLevel,
  event: ObservabilityRuntimeEventInput,
) {
  if (level === 'verbose') {
    return true;
  }

  if (level === 'summary') {
    return event.status !== 'start';
  }

  return event.status === 'error' || Boolean(event.error);
}

function createTraceId(event: ObservabilityRuntimeEventInput) {
  traceCounter += 1;
  const owner = event.remote?.name || event.phase || 'runtime';
  const normalizedOwner = owner.replace(/[^a-z0-9]+/gi, '-').slice(0, 80);

  return `mf-${normalizedOwner}-${Date.now().toString(36)}-${traceCounter.toString(
    36,
  )}`;
}

function getPhaseDurationKey(event: ObservabilityEvent) {
  const exposeKey =
    event.phase === 'expose' || event.phase === 'moduleFactory'
      ? event.expose || ''
      : '';

  return [
    event.traceId,
    event.phase,
    event.requestId || event.remote?.name || event.shared?.name || '',
    exposeKey,
  ].join('|');
}

function getRemoteEntryKey(
  remote: ObservabilityRemoteInfo | undefined,
): string | undefined {
  if (!remote?.name) {
    return undefined;
  }

  return [remote.name, remote.entryGlobalName || '', remote.entry || ''].join(
    '|',
  );
}

function getHostRemotesSummary(
  options: ObservabilityRuntimeOptions | undefined,
): string | undefined {
  const remotes = (options?.remotes || [])
    .map((remote) => clipText(remote.alias || remote.name || remote.entry, 120))
    .filter((remote): remote is string => Boolean(remote))
    .slice(0, 20);

  return remotes.length ? remotes.join(',') : undefined;
}

function resolveRemoteFromRequestId(
  id: string | undefined,
  options: ObservabilityRuntimeOptions | undefined,
): ObservabilityRemoteInfo | undefined {
  if (!id) {
    return undefined;
  }

  const matchedRemote = (options?.remotes || [])
    .filter((remote) => {
      const keys = [remote.alias, remote.name].filter((key): key is string =>
        Boolean(key),
      );

      return keys.some((key) => id === key || id.startsWith(`${key}/`));
    })
    .sort((left, right) => {
      const leftKey = left.alias || left.name || '';
      const rightKey = right.alias || right.name || '';

      return rightKey.length - leftKey.length;
    })[0];

  return createRemoteInfo(matchedRemote);
}

function resolveAliasRequestId(
  requestId: string | undefined,
  remote: ObservabilityRemoteInfo | undefined,
): string | undefined {
  if (!requestId || !remote?.alias || remote.alias === remote.name) {
    return undefined;
  }

  if (requestId === remote.name) {
    return remote.alias;
  }

  if (requestId.startsWith(`${remote.name}/`)) {
    return `${remote.alias}/${requestId.slice(remote.name.length + 1)}`;
  }

  return undefined;
}

function sanitizeModuleInfoPath(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return clipText(value, 320);
}

function sanitizeModuleInfoGetPublicPath(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return clipText(value, 500);
}

function sanitizeModuleInfoRemoteEntry(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return clipText(value, 320);
}

function createClippedModuleInfoEntry(
  rawName: string,
  rawValue: unknown,
): ObservabilityModuleInfoEntry | undefined {
  const name = clipText(rawName, 240);
  if (!name) {
    return undefined;
  }

  const value = isRecord(rawValue) ? rawValue : {};

  return {
    name,
    publicPath: sanitizeModuleInfoPath(value['publicPath']),
    getPublicPath: sanitizeModuleInfoGetPublicPath(value['getPublicPath']),
    remoteEntry: sanitizeModuleInfoRemoteEntry(value['remoteEntry']),
    globalName: sanitizeText(value['globalName'], 160),
  };
}

function normalizeModuleInfoLookupValue(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) {
    return undefined;
  }

  const sanitized =
    /^https?:\/\//i.test(value) || value.startsWith('/')
      ? sanitizeUrl(value)
      : sanitizeText(value, 240);

  return sanitized?.toLowerCase();
}

function getModuleInfoLookupValues(report: ObservabilityReport): Set<string> {
  return new Set(
    [
      report.requestId?.split('/')[0],
      report.remote?.name,
      report.remote?.alias,
      report.remote?.entry,
      report.remote?.entryGlobalName,
      report.sanitizedUrl,
      report.errorContext?.['remoteName'],
      report.errorContext?.['remoteAlias'],
      report.errorContext?.['url'],
      report.summary.error?.context?.['remoteName'],
      report.summary.error?.context?.['remoteAlias'],
      report.summary.error?.context?.['url'],
    ]
      .map(normalizeModuleInfoLookupValue)
      .filter((value): value is string => Boolean(value)),
  );
}

function matchesModuleInfoLookup(
  entry: ObservabilityModuleInfoEntry,
  lookupValues: Set<string>,
): boolean {
  if (!lookupValues.size) {
    return false;
  }

  const entryValues = [
    entry.name,
    entry.publicPath,
    entry.getPublicPath,
    entry.remoteEntry,
    entry.globalName,
  ]
    .map(normalizeModuleInfoLookupValue)
    .filter((value): value is string => Boolean(value));

  return entryValues.some((entryValue) =>
    Array.from(lookupValues).some(
      (lookupValue) =>
        entryValue === lookupValue ||
        entryValue.startsWith(`${lookupValue}:`) ||
        entryValue.includes(`:${lookupValue}`) ||
        (lookupValue.startsWith('http') && entryValue.includes(lookupValue)),
    ),
  );
}

function getModuleInfoCaptureReason(
  report: ObservabilityReport,
): string | undefined {
  const text = [
    report.errorCode,
    report.errorName,
    report.errorMessage,
    report.summary.error?.errorCode,
    report.summary.error?.errorName,
    report.summary.error?.errorMessage,
    ...report.events.flatMap((event) => [
      event.errorCode,
      event.errorName,
      event.errorMessage,
      event.message,
      event.lifecycle,
    ]),
  ].join('\n');

  if (/RUNTIME-007/.test(text)) {
    return 'remote-snapshot';
  }
  if (/RUNTIME-011/.test(text)) {
    return 'remote-entry-missing-in-snapshot';
  }
  if (/moduleInfo|module info/i.test(text)) {
    return 'module-info';
  }
  if (/remote snapshot|global snapshot|snapshot/i.test(text)) {
    return 'remote-snapshot';
  }

  return undefined;
}

function createModuleInfoSummary(
  report: ObservabilityReport,
): ObservabilityModuleInfoSummary | undefined {
  const reason = getModuleInfoCaptureReason(report);
  if (!reason) {
    return undefined;
  }

  const moduleInfo = getFederationGlobal()?.moduleInfo;
  const rawEntries = isRecord(moduleInfo) ? Object.entries(moduleInfo) : [];
  const clippedEntries = rawEntries
    .map(([name, value]) => createClippedModuleInfoEntry(name, value))
    .filter((entry): entry is ObservabilityModuleInfoEntry => Boolean(entry));
  const lookupValues = getModuleInfoLookupValues(report);
  const matchedEntries = clippedEntries.filter((entry) =>
    matchesModuleInfoLookup(entry, lookupValues),
  );

  return {
    reason,
    clipped: true,
    totalCount: rawEntries.length,
    matchedCount: matchedEntries.length,
    entries: matchedEntries.slice(0, MAX_MODULE_INFO_ENTRIES),
    availableNames: matchedEntries.length
      ? undefined
      : clippedEntries
          .map((entry) => entry.name)
          .slice(0, MAX_MODULE_INFO_ENTRIES),
  };
}

function getResourceErrorType(
  event: Pick<
    ObservabilityEvent,
    'errorCode' | 'errorMessage' | 'message' | 'lifecycle' | 'resource'
  >,
): string | undefined {
  if (event.resource?.errorType) {
    return event.resource.errorType;
  }
  const text = `${event.errorMessage || ''}\n${event.message || ''}`;

  if (!event.errorCode && !text) {
    return undefined;
  }

  if (/ScriptExecutionError/i.test(text)) {
    return 'script-execution';
  }

  if (/timeout|timed out/i.test(text)) {
    return 'timeout';
  }

  if (
    /ScriptNetworkError|NetworkError|Failed to fetch|Request failed|ERR_|404|CORS/i.test(
      text,
    )
  ) {
    return 'network';
  }

  return event.errorCode === 'RUNTIME-008' ? 'unknown' : undefined;
}

function getOwnerHint(
  event: Pick<
    ObservabilityEvent,
    | 'errorCode'
    | 'phase'
    | 'shared'
    | 'remote'
    | 'errorMessage'
    | 'message'
    | 'lifecycle'
    | 'resource'
  >,
): ObservabilityOwnerHint | undefined {
  const resourceErrorType = getResourceErrorType(event);

  if (event.resource?.errorType) {
    if (
      resourceErrorType === 'network' ||
      resourceErrorType === 'timeout' ||
      resourceErrorType === 'http'
    ) {
      return 'network';
    }
    if (resourceErrorType === 'execution' || resourceErrorType === 'content') {
      return 'remote';
    }
  }

  switch (event.errorCode) {
    case 'RUNTIME-001':
    case 'RUNTIME-002':
    case 'RUNTIME-011':
    case 'RUNTIME-013':
    case 'RUNTIME-014':
    case 'RUNTIME-015':
      return 'remote';
    case 'RUNTIME-003':
    case 'RUNTIME-004':
    case 'RUNTIME-007':
      return 'host';
    case 'RUNTIME-005':
    case 'RUNTIME-006':
    case 'RUNTIME-012':
      return 'shared';
    case 'RUNTIME-008':
      return resourceErrorType === 'network' || resourceErrorType === 'timeout'
        ? 'network'
        : 'remote';
    default:
      if (event.shared) {
        return 'shared';
      }
      if (event.remote) {
        return 'remote';
      }
      if (event.phase === 'manifest' || event.phase === 'matchRemote') {
        return 'host';
      }
      return event.errorCode ? 'runtime' : undefined;
  }
}

function getRetryable(
  event: Pick<
    ObservabilityEvent,
    'errorCode' | 'errorMessage' | 'message' | 'lifecycle' | 'resource'
  >,
): boolean | undefined {
  const resourceErrorType = getResourceErrorType(event);

  if (resourceErrorType === 'network' || resourceErrorType === 'timeout') {
    return true;
  }
  if (resourceErrorType === 'execution' || resourceErrorType === 'content') {
    return false;
  }

  if (event.errorCode === 'RUNTIME-008') {
    return resourceErrorType === 'network' || resourceErrorType === 'timeout';
  }

  if (event.errorCode === 'RUNTIME-003') {
    const text = `${event.errorMessage || ''}\n${event.message || ''}`;
    return /NetworkError|Failed to fetch|Request failed|timeout|timed out/i.test(
      text,
    );
  }

  if (
    event.errorCode &&
    [
      'RUNTIME-001',
      'RUNTIME-002',
      'RUNTIME-004',
      'RUNTIME-005',
      'RUNTIME-006',
      'RUNTIME-011',
      'RUNTIME-012',
      'RUNTIME-013',
      'RUNTIME-014',
      'RUNTIME-015',
    ].includes(event.errorCode)
  ) {
    return false;
  }

  return undefined;
}

function createErrorContext(
  event: ObservabilityEvent,
  inputContext?: Record<string, unknown>,
): ObservabilityMetadata | undefined {
  const context: Record<string, unknown> = {
    ...inputContext,
  };

  if (event.lifecycle) {
    context['lifecycle'] = event.lifecycle;
  }
  if (event.requestId) {
    context['requestId'] = event.requestId;
  }
  if (event.requestAlias) {
    context['requestAlias'] = event.requestAlias;
  }
  if (event.remote?.name) {
    context['remoteName'] = event.remote.name;
  }
  if (event.remote?.alias) {
    context['remoteAlias'] = event.remote.alias;
  }
  if (event.remote?.type) {
    context['remoteType'] = event.remote.type;
  }
  if (event.remote?.entryGlobalName) {
    context['entryGlobalName'] = event.remote.entryGlobalName;
  }
  if (event.sanitizedUrl) {
    context['url'] = event.sanitizedUrl;
  }
  if (event.expose) {
    context['expose'] = event.expose;
  }
  if (event.shared?.name) {
    context['shareName'] = event.shared.name;
  }
  if (event.shared?.requiredVersion) {
    context['requiredVersion'] = event.shared.requiredVersion;
  }
  if (event.shared?.selectedVersion) {
    context['selectedVersion'] = event.shared.selectedVersion;
  }
  if (event.shared?.provider) {
    context['provider'] = event.shared.provider;
  }

  const resourceErrorType = getResourceErrorType(event);
  if (resourceErrorType) {
    context['resourceErrorType'] = resourceErrorType;
  }

  return clipObservabilityMetadata(context);
}

export function createObservability(
  rawOptions: ObservabilityPluginOptions = {},
  adapterOptions: ObservabilityRuntimeAdapterOptions = {},
): ObservabilityController {
  const options: ObservabilityPluginOptions = {
    ...rawOptions,
    browser: adapterOptions.fixedBrowserScope
      ? {
          ...rawOptions.browser,
          scope: adapterOptions.fixedBrowserScope,
        }
      : rawOptions.browser,
    react: adapterOptions.disableReact
      ? {
          ...rawOptions.react,
          enabled: false,
          injectLoadedCallback: false,
        }
      : rawOptions.react,
  };
  const pluginName = adapterOptions.pluginName || 'observability-plugin';
  const shouldAttachInstanceApi = adapterOptions.attachInstanceApi !== false;
  const shouldGuardSharedHooksByRuntimeVersion =
    adapterOptions.guardSharedHooksByRuntimeVersion === true;
  const shouldGuardRuntimeHooksByRuntimeVersion =
    adapterOptions.guardRuntimeHooksByRuntimeVersion === true;
  const shouldDisablePreloadHooks = adapterOptions.disablePreloadHooks === true;
  const shouldReturnHookArgs = adapterOptions.returnHookArgs === true;
  const shouldForceDevelopmentChannels =
    adapterOptions.forceDevelopmentChannels === true;
  const returnHookArgs = <T>(args: T): T | undefined =>
    shouldReturnHookArgs ? args : undefined;
  const level = options.level || 'summary';
  const configuredMaxEvents = normalizeMaxEvents(
    options.maxEvents,
    DEFAULT_MAX_EVENTS,
  );
  const events: ObservabilityEvent[] = [];
  const reports = new Map<string, ObservabilityReport>();
  const latestTraceByInstance = new Map<string, string>();
  const traceByRequest = new Map<string, string>();
  const traceByRemote = new Map<string, string>();
  const traceByBridgeOperation = new Map<string, string>();
  const traceByBridgeId = new Map<string, string>();
  const bridgeStartTimes = new Map<string, number>();
  const bridgeOperations = new WeakMap<
    object,
    { operationId: string; bridgeId: string }
  >();
  const bridgeIdsByTarget = new WeakMap<object, string>();
  const bridgeIdsByFallback = new Map<string, string>();
  const resourceStartTimes = new Map<string, number[]>();
  const sharedSelections = new Map<
    string,
    ObservabilityRuntimeSharedSelectionResult
  >();
  const instanceRefs = new WeakMap<object, string>();
  const instancesByRef = new Map<string, ObservabilityRuntimeOrigin>();
  const bridgeStatesByInstance = new Map<
    string,
    Map<string, ObservabilityBridgeState>
  >();
  const lateBoundInstanceRefs = new Set<string>();
  const boundInstanceRefs = new Set<string>();
  const attachedInstanceApis = new WeakMap<object, ObservabilityInstanceAPI>();
  const phaseStartTimes = new Map<string, number>();
  const reportedSharedConflictKeys = new Set<string>();
  const reportedBridgeProviderKeys = new Set<string>();
  const collectorOptions = normalizeCollectorOptions(options.collector);
  const devtoolsOptions = normalizeDevtoolsOptions(options.devtools);
  const seenManifestUrls = new Set<string>();
  const loadingManifestUrls = new Set<string>();
  const seenRemoteEntryKeys = new Set<string>();
  const consoleReportedTraceIds = new Set<string>();
  const consoleReportedStartKeys = new Set<string>();
  let latestTraceId: string | undefined;
  let runtimeObservabilityEnabled = false;
  let suppressRuntimeEvents = false;
  let effectiveMaxEvents = configuredMaxEvents;
  let browserGlobalScope: string | undefined;
  let lastRuntimeOrigin: ObservabilityRuntimeOrigin | undefined;
  let appliedRuntimeVersion: string | undefined;
  let instanceRefCounter = 0;
  let sharedOperationCounter = 0;
  let sharedRegistrationCounter = 0;
  let bridgeOperationCounter = 0;
  let bridgeCounter = 0;
  let historyCleared = false;

  const getActiveRuntimeInstances = () => {
    const federation = getFederationGlobal();
    return Array.isArray(federation?.__INSTANCES__)
      ? federation.__INSTANCES__
      : [];
  };

  const registerRuntimeInstance = (
    origin: ObservabilityRuntimeOrigin,
    lateBound?: boolean,
  ) => {
    const existingRef = instanceRefs.get(origin);
    if (existingRef) {
      return existingRef;
    }

    instanceRefCounter += 1;
    const instanceRef = `mf-${instanceRefCounter}`;
    instanceRefs.set(origin, instanceRef);
    instancesByRef.set(instanceRef, origin);
    if (
      lateBound ??
      getActiveRuntimeInstances().some((instance) => instance === origin)
    ) {
      lateBoundInstanceRefs.add(instanceRef);
    }
    return instanceRef;
  };

  const getInstanceRef = (origin?: ObservabilityRuntimeOrigin) =>
    origin ? registerRuntimeInstance(origin) : undefined;

  const getTraceMapKey = (instanceRef: string | undefined, value: string) =>
    `${instanceRef || 'legacy'}\u0000${value}`;

  const isEnabled = () => {
    if (options.enabled === false) {
      return false;
    }

    runtimeObservabilityEnabled = true;
    return true;
  };

  const resolveTraceId = (event: ObservabilityRuntimeEventInput) => {
    const sanitizedRequestId = sanitizeRequestId(event.requestId);
    const instanceRef = sanitizeText(event.instanceRef, 80);

    if (event.traceId && reports.has(event.traceId)) {
      return event.traceId;
    }

    if (event.status === 'start' && event.phase === 'loadRemote') {
      const traceId = event.traceId || createTraceId(event);
      if (sanitizedRequestId) {
        traceByRequest.set(
          getTraceMapKey(instanceRef, sanitizedRequestId),
          traceId,
        );
      }
      if (event.remote?.name) {
        traceByRemote.set(
          getTraceMapKey(instanceRef, event.remote.name),
          traceId,
        );
      }
      return traceId;
    }

    if (sanitizedRequestId) {
      const traceId = traceByRequest.get(
        getTraceMapKey(instanceRef, sanitizedRequestId),
      );
      if (traceId) {
        return traceId;
      }
    }

    if (event.bridge?.operationId) {
      const traceId = traceByBridgeOperation.get(
        getTraceMapKey(instanceRef, event.bridge.operationId),
      );
      if (traceId) {
        return traceId;
      }
    }
    if (event.bridge?.bridgeId) {
      const traceId = traceByBridgeId.get(
        getTraceMapKey(instanceRef, event.bridge.bridgeId),
      );
      if (traceId) {
        return traceId;
      }
    }
    if (
      event.bridge?.operationId &&
      (event.status === 'start' || event.phase === 'bridge-provider')
    ) {
      return event.traceId || createTraceId(event);
    }

    if (event.remote?.name) {
      const traceId = traceByRemote.get(
        getTraceMapKey(instanceRef, event.remote.name),
      );
      if (traceId) {
        return traceId;
      }
    }
    return event.traceId || createTraceId(event);
  };

  const normalizeEvent = (
    event: ObservabilityRuntimeEventInput,
    traceId: string,
    origin?: ObservabilityRuntimeOrigin,
  ): ObservabilityEvent => {
    const errorInfo = getErrorInfo(event.error, options.stackTrace);
    const sanitizedRemote = sanitizeRemote(event.remote);
    const sanitizedResource = sanitizeResource(event.resource);
    const sanitizedShared = sanitizeShared(event.shared);
    const requestAlias =
      sanitizeRequestId(event.requestAlias) ||
      resolveAliasRequestId(event.requestId, sanitizedRemote);
    const hostName =
      sanitizeText(event.hostName, 120) ||
      sanitizeText(origin?.options?.name, 120);
    const runtimeVersion =
      sanitizeText(origin?.version, 80) || appliedRuntimeVersion;
    const message = sanitizedResource
      ? sanitizeText(event.message) || sanitizeText(errorInfo.errorMessage)
      : getRawText(event.message) || errorInfo.errorMessage;
    const normalizedErrorMessage = sanitizedResource
      ? sanitizeText(errorInfo.errorMessage)
      : errorInfo.errorMessage;
    const normalizedErrorStack = sanitizedResource
      ? sanitizeText(errorInfo.errorStack, 4000)
      : errorInfo.errorStack;

    const normalizedEvent: ObservabilityEvent = {
      traceId,
      instanceRef: event.instanceRef || getInstanceRef(origin),
      timestamp: event.timestamp || Date.now(),
      phase: sanitizeText(event.phase, 120) || 'runtime',
      status: event.status,
      requestId: sanitizeRequestId(event.requestId),
      requestAlias,
      hostName,
      runtimeVersion,
      remote: sanitizedRemote,
      resource: sanitizedResource,
      shared: sanitizedShared,
      expose: sanitizeText(event.expose, 240),
      sanitizedUrl:
        sanitizedResource?.url ||
        clipText(event.url || event.remote?.entry, 320),
      message,
      errorCode: errorInfo.errorCode,
      errorName: errorInfo.errorName,
      errorMessage: normalizedErrorMessage,
      errorStack: normalizedErrorStack,
      duration:
        typeof event.duration === 'number' && Number.isFinite(event.duration)
          ? Math.max(0, event.duration)
          : undefined,
      lifecycle: sanitizeText(event.lifecycle, 120),
      eventName: sanitizeText(event.eventName, 160),
      source: normalizeEventSource(event.source),
      recovered: event.recovered === true || undefined,
      cached: event.cached === true || undefined,
      componentName: sanitizeText(event.componentName, 160),
      metadata: clipObservabilityMetadata(event.metadata),
      loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
      bridge: copyBridgeInfo(event.bridge),
    };

    if (normalizedEvent.status === 'error' || event.error) {
      normalizedEvent.ownerHint = getOwnerHint(normalizedEvent);
      normalizedEvent.retryable = getRetryable(normalizedEvent);
      normalizedEvent.errorContext = createErrorContext(
        normalizedEvent,
        event.errorContext,
      );
    }

    return normalizedEvent;
  };

  const supportsRuntimeHookObservability = (
    origin?: ObservabilityRuntimeOrigin,
  ) =>
    supportsRuntimeObservability({
      ...origin,
      version:
        sanitizeText(origin?.version, 80) ||
        appliedRuntimeVersion ||
        origin?.version,
    } as ObservabilityRuntimeOrigin);

  const shouldSkipRuntimeHook = (origin?: ObservabilityRuntimeOrigin) =>
    shouldGuardRuntimeHooksByRuntimeVersion &&
    !supportsRuntimeHookObservability(origin);

  const supportsResourceLifecycle = (
    origin?: ObservabilityRuntimeOrigin,
  ): boolean =>
    Boolean(
      origin?.loaderHook?.lifecycle?.beforeLoadResource &&
      origin.loaderHook.lifecycle.afterLoadResource,
    );

  const applyPhaseDuration = (event: ObservabilityEvent) => {
    const key = getPhaseDurationKey(event);

    if (event.status === 'start') {
      phaseStartTimes.set(key, event.timestamp);
      return;
    }

    if (event.duration !== undefined) {
      return;
    }

    const startedAt = phaseStartTimes.get(key);
    if (startedAt === undefined) {
      return;
    }

    event.duration = Math.max(0, event.timestamp - startedAt);
    phaseStartTimes.delete(key);
  };

  const updateTraceMaps = (event: ObservabilityEvent) => {
    if (event.requestId) {
      traceByRequest.set(
        getTraceMapKey(event.instanceRef, event.requestId),
        event.traceId,
      );
    }

    if (event.remote?.name) {
      traceByRemote.set(
        getTraceMapKey(event.instanceRef, event.remote.name),
        event.traceId,
      );
    }
    if (event.bridge?.operationId) {
      traceByBridgeOperation.set(
        getTraceMapKey(event.instanceRef, event.bridge.operationId),
        event.traceId,
      );
    }
    if (event.bridge?.bridgeId) {
      traceByBridgeId.set(
        getTraceMapKey(event.instanceRef, event.bridge.bridgeId),
        event.traceId,
      );
    }
  };

  const trimEvents = (report: ObservabilityReport) => {
    while (events.length > effectiveMaxEvents) {
      events.shift();
    }

    while (report.events.length > effectiveMaxEvents) {
      report.events.shift();
    }
  };

  const getEventOutcome = (event: ObservabilityEvent) => {
    if (event.status === 'success') {
      return 'success';
    }

    if (event.status === 'error') {
      return 'error';
    }

    if (event.status === 'complete') {
      if (event.recovered) {
        return 'recovered';
      }

      if (event.errorName || event.errorMessage) {
        return 'error';
      }
    }

    return undefined;
  };

  const isLoadRemoteCompleteEvent = (event: ObservabilityEvent) =>
    event.phase === 'loadRemote' && event.status === 'complete';

  const isRuntimeLoadedEvent = (event: ObservabilityEvent) =>
    event.phase === 'loadRemote' &&
    (event.status === 'success' ||
      (event.status === 'complete' && event.recovered));

  const isSharedResolvedEvent = (event: ObservabilityEvent) =>
    event.phase === 'shared' &&
    (event.status === 'success' ||
      (event.status === 'complete' && event.recovered));

  const isSharedRegisteredEvent = (event: ObservabilityEvent) =>
    event.phase === 'shared-registration' && event.status === 'success';

  const isPreloadedEvent = (event: ObservabilityEvent) =>
    event.phase === 'preload' && event.status === 'success';

  const isComponentLoadedEvent = (event: ObservabilityEvent) =>
    event.status === 'success' &&
    (event.eventName === COMPONENT_BUSINESS_LOADED_EVENT ||
      (event.phase === 'component' &&
        event.message === COMPONENT_BUSINESS_LOADED_EVENT));

  const shouldReplaceFailedPhase = (
    report: ObservabilityReport,
    event: ObservabilityEvent,
  ) => {
    if (isLoadRemoteCompleteEvent(event) && report.failedPhase) {
      return false;
    }

    if (!report.failedPhase) {
      return true;
    }

    return report.failedPhase === 'loadRemote' && event.phase !== 'loadRemote';
  };

  const createEmptyPhaseCollection = (): ObservabilityPhaseCollection => ({
    phases: {},
    flags: {
      cached: false,
      fallback: false,
      recovered: false,
    },
  });

  const createPhaseCollection = (
    eventsForReport: ObservabilityEvent[],
  ): ObservabilityPhaseCollection => {
    const collection = createEmptyPhaseCollection();

    eventsForReport.forEach((event) => {
      const phase = event.phase;
      const phaseSummary =
        collection.phases[phase] ||
        ({
          status: event.status,
        } satisfies ObservabilityPhaseSummary);

      if (event.status !== 'start') {
        phaseSummary.status = event.status;
      }
      if (event.duration !== undefined) {
        phaseSummary.duration = event.duration;
      }
      if (event.cached) {
        phaseSummary.cached = true;
        collection.flags.cached = true;
      }
      if (event.recovered) {
        phaseSummary.recovered = true;
        collection.flags.recovered = true;
      }
      if (event.lifecycle) {
        phaseSummary.lifecycle = event.lifecycle;
      }

      collection.phases[phase] = phaseSummary;

      if (
        event.phase === 'loadRemote' &&
        event.status === 'complete' &&
        event.recovered
      ) {
        collection.flags.fallback = true;
      }
      if (event.shared?.fallback) {
        collection.flags.fallback = true;
      }
      if (event.shared?.selectedVersion || event.shared?.provider) {
        collection.shared = {
          name: event.shared.name,
          provider: event.shared.provider,
          selectedVersion: event.shared.selectedVersion,
          shareScope: event.shared.shareScope
            ? [...event.shared.shareScope]
            : undefined,
        };
      }
    });

    return collection;
  };

  const createErrorSummary = (
    eventsForReport: ObservabilityEvent[],
    failedPhase?: string,
  ): ObservabilityErrorSummary | undefined => {
    const errorEvent =
      eventsForReport.find(
        (event) => event.status === 'error' && event.phase === failedPhase,
      ) ||
      eventsForReport.find((event) => event.status === 'error') ||
      eventsForReport.find(
        (event) => event.status === 'complete' && event.errorMessage,
      );

    if (!errorEvent) {
      return undefined;
    }

    return {
      errorCode: errorEvent.errorCode,
      errorName: errorEvent.errorName,
      errorMessage: errorEvent.errorMessage,
      failedPhase: failedPhase || errorEvent.phase,
      lifecycle: errorEvent.lifecycle,
      ownerHint: errorEvent.ownerHint,
      retryable: errorEvent.retryable,
      context: errorEvent.errorContext
        ? { ...errorEvent.errorContext }
        : undefined,
    };
  };

  const createReportSummary = (
    report: ObservabilityReport,
  ): ObservabilityReport['summary'] => {
    const loadCompleted = report.events.some(isLoadRemoteCompleteEvent);
    const runtimeLoaded = report.events.some(isRuntimeLoadedEvent);
    const sharedResolved = report.events.some(isSharedResolvedEvent);
    const sharedRegistered = report.events.some(isSharedRegisteredEvent);
    const preloaded = report.events.some(isPreloadedEvent);
    const recovered = report.events.some((item) => item.recovered);
    const componentLoaded = report.events.some(isComponentLoadedEvent);
    const lastEvent = report.events[report.events.length - 1];
    let outcome: ObservabilityReportOutcome = 'pending';

    if (recovered) {
      outcome = 'recovered';
    } else if (componentLoaded) {
      outcome = 'component-loaded';
    } else if (report.status === 'error') {
      outcome = 'failed';
    } else if (runtimeLoaded) {
      outcome = 'runtime-loaded';
    } else if (sharedResolved) {
      outcome = 'shared-resolved';
    } else if (sharedRegistered) {
      outcome = 'shared-registered';
    } else if (preloaded) {
      outcome = 'preloaded';
    }

    const phaseCollection = createPhaseCollection(report.events);

    return {
      eventCount: report.events.length,
      recovered,
      loadCompleted,
      runtimeLoaded,
      sharedResolved,
      sharedRegistered,
      preloaded,
      componentLoaded,
      outcome,
      lastPhase: lastEvent?.phase,
      phases: phaseCollection.phases,
      shared: phaseCollection.shared,
      flags: phaseCollection.flags,
      error: createErrorSummary(report.events, report.failedPhase),
    };
  };

  const refreshModuleInfoSummary = (report: ObservabilityReport) => {
    const moduleInfo = createModuleInfoSummary(report);
    if (moduleInfo) {
      report.moduleInfo = moduleInfo;
    }
  };

  const getReportContext = (
    report: ObservabilityReport,
  ): ObservabilityMetadata | undefined =>
    report.summary.error?.context || report.errorContext;

  const getContextText = (
    context: ObservabilityMetadata | undefined,
    key: string,
  ): string | undefined => {
    const value = context?.[key];
    return typeof value === 'string' && value ? value : undefined;
  };

  const getDiagnosisOwnerHint = (
    report: ObservabilityReport,
  ): ObservabilityOwnerHint =>
    report.summary.error?.ownerHint ||
    report.ownerHint ||
    (report.shared ? 'shared' : report.remote ? 'remote' : 'unknown');

  const getDiagnosisResourceErrorType = (
    report: ObservabilityReport,
  ): string | undefined =>
    getContextText(getReportContext(report), 'resourceErrorType') ||
    getResourceErrorType({
      errorCode: report.errorCode,
      errorMessage: report.errorMessage,
      message: report.events.at(-1)?.message,
      lifecycle: report.summary.error?.lifecycle,
    });

  const getDiagnosisDocLink = (
    report: ObservabilityReport,
  ): string | undefined => {
    const text = [
      report.errorMessage,
      report.errorStack,
      ...report.events.flatMap((event) => [
        event.errorMessage,
        event.errorStack,
        event.message,
      ]),
    ]
      .filter((item): item is string => Boolean(item))
      .join('\n');
    const matched = text.match(DIAGNOSTIC_DOC_LINK_PATTERN)?.[0];
    const docLink = sanitizeText(matched, 240);

    if (docLink) {
      return docLink;
    }

    return report.errorCode?.startsWith('RUNTIME-')
      ? RUNTIME_DOC_LINK
      : undefined;
  };

  const getDiagnosisTitle = (report: ObservabilityReport) => {
    if (report.status !== 'error') {
      if (report.shared) {
        if (
          report.shared.reason === SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON
        ) {
          return 'Singleton shared dependency version conflict detected';
        }
        if (report.summary.sharedResolved) {
          return 'Shared dependency resolved successfully';
        }
        return 'Shared dependency loading is pending';
      }
      if (report.summary.componentLoaded) {
        return 'Business component loaded';
      }
      if (report.summary.runtimeLoaded) {
        return 'Remote loaded successfully';
      }
      if (report.summary.preloaded) {
        return 'Remote preloaded successfully';
      }
      return 'Remote loading is pending';
    }

    switch (report.errorCode) {
      case 'RUNTIME-001':
        return 'Remote entry global was not registered';
      case 'RUNTIME-003':
        return 'Manifest could not be loaded';
      case 'RUNTIME-004':
        return 'Remote was not found in host remotes';
      case 'RUNTIME-007':
        return 'Deployment moduleInfo did not match the requested remote';
      case 'RUNTIME-013':
        return 'Manifest is not a valid Module Federation manifest';
      case 'RUNTIME-014':
        return 'Requested expose was not found in the remote';
      case 'RUNTIME-015':
        return 'Remote container initialization failed';
      case 'RUNTIME-005':
      case 'RUNTIME-006':
        return 'Shared dependency could not be resolved';
      case 'RUNTIME-008': {
        const resourceErrorType = getDiagnosisResourceErrorType(report);
        if (resourceErrorType === 'network') {
          return 'Remote entry failed because of a network error';
        }
        if (resourceErrorType === 'timeout') {
          return 'Remote entry request timed out';
        }
        if (resourceErrorType === 'script-execution') {
          return 'Remote entry loaded but failed during execution';
        }
        return 'Remote entry resource could not be loaded';
      }
      default:
        if (report.failedPhase === 'shared' || report.shared) {
          return 'Shared dependency could not be resolved';
        }
        return report.failedPhase
          ? `Module Federation failed at ${report.failedPhase}`
          : 'Module Federation loading failed';
    }
  };

  const getCompletedPhases = (report: ObservabilityReport) =>
    Array.from(
      new Set(
        report.events
          .filter(
            (event) =>
              event.status === 'success' || event.status === 'complete',
          )
          .map((event) => event.phase),
      ),
    );

  const getPendingPhases = (report: ObservabilityReport) => {
    const started = new Set<string>();
    const ended = new Set<string>();

    report.events.forEach((event) => {
      if (event.status === 'start') {
        started.add(event.phase);
        return;
      }

      ended.add(event.phase);
    });

    return Array.from(started).filter((phase) => !ended.has(phase));
  };

  const createDiagnosisFacts = (
    report: ObservabilityReport,
    ownerHint: ObservabilityOwnerHint,
  ): ObservabilityMetadata => {
    const context = getReportContext(report);
    const facts: Record<string, unknown> = {};
    const addFact = (key: string, value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      facts[key] = Array.isArray(value) ? value.join(',') : value;
    };

    addFact('traceId', report.traceId);
    addFact('status', report.status);
    addFact('outcome', report.summary.outcome);
    addFact('errorCode', report.errorCode || report.summary.error?.errorCode);
    addFact(
      'failedPhase',
      report.failedPhase || report.summary.error?.failedPhase,
    );
    addFact('lifecycle', report.summary.error?.lifecycle);
    addFact('ownerHint', ownerHint);
    addFact('retryable', report.retryable ?? report.summary.error?.retryable);
    addFact('requestId', report.requestId);
    addFact(
      'requestAlias',
      report.requestAlias || report.summary.error?.context?.['requestAlias'],
    );
    addFact('hostName', report.hostName);
    addFact('remoteName', report.remote?.name);
    addFact('remoteAlias', report.remote?.alias);
    addFact('remoteEntry', report.remote?.entry);
    addFact('entryGlobalName', report.remote?.entryGlobalName);
    addFact('remoteType', report.remote?.type);
    addFact('url', report.sanitizedUrl || getContextText(context, 'url'));
    addFact('expose', report.expose);
    addFact('hostRemotes', getContextText(context, 'hostRemotes'));
    addFact('resourceErrorType', getDiagnosisResourceErrorType(report));
    addFact('shareName', report.shared?.name);
    addFact('shareScope', report.shared?.shareScope);
    addFact('shareVersion', report.shared?.version);
    addFact('requiredVersion', report.shared?.requiredVersion);
    addFact('selectedVersion', report.shared?.selectedVersion);
    addFact('availableVersions', report.shared?.availableVersions);
    addFact('provider', report.shared?.provider);
    addFact('useIn', report.shared?.useIn);
    addFact('sharedDefinedBy', report.shared?.definedBy);
    addFact('singleton', report.shared?.singleton);
    addFact('strictVersion', report.shared?.strictVersion);
    addFact('eager', report.shared?.eager);
    addFact('sharedReason', report.shared?.reason);
    addFact(
      'componentName',
      report.events.find(isComponentLoadedEvent)?.componentName,
    );
    addFact('moduleInfoReason', report.moduleInfo?.reason);
    addFact('moduleInfoTotalCount', report.moduleInfo?.totalCount);
    addFact('moduleInfoMatchedCount', report.moduleInfo?.matchedCount);
    addFact(
      'moduleInfoNames',
      report.moduleInfo?.entries.length
        ? report.moduleInfo.entries.map((entry) => entry.name)
        : report.moduleInfo?.availableNames,
    );
    addFact('cached', report.summary.flags.cached);
    addFact('fallback', report.summary.flags.fallback);
    addFact('recovered', report.summary.recovered);
    addFact('loadCompleted', report.summary.loadCompleted);
    addFact('runtimeLoaded', report.summary.runtimeLoaded);
    addFact('componentLoaded', report.summary.componentLoaded);

    return clipMetadata(facts, MAX_FACT_KEYS) || {};
  };

  const createDiagnosisWarnings = (report: ObservabilityReport) => {
    const warnings: string[] = [];

    if (report.status === 'error' && !report.errorCode) {
      warnings.push('No known Module Federation error code was captured');
    }
    if (report.summary.flags.fallback) {
      warnings.push('Remote loading completed through fallback recovery');
    }
    if (report.summary.runtimeLoaded && !report.summary.componentLoaded) {
      warnings.push('Business component readiness signal was not recorded');
    }
    if (report.moduleInfo && report.moduleInfo.matchedCount === 0) {
      warnings.push(
        'No matching clipped moduleInfo entry was found for the failed remote',
      );
    }
    if (report.shared?.reason === SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON) {
      warnings.push(
        'Singleton shared dependency has multiple versions in the same share scope',
      );
    }

    return warnings;
  };

  const createDiagnosisActions = (
    report: ObservabilityReport,
    ownerHint: ObservabilityOwnerHint,
  ): ObservabilityAction[] => {
    const actions: ObservabilityAction[] = [];
    const pushAction = (
      id: ObservabilityActionId,
      title: string,
      hint: ObservabilityOwnerHint = ownerHint,
      detail?: string,
    ) => {
      actions.push({
        id,
        ownerHint: hint,
        title,
        detail,
      });
    };

    if (report.shared?.reason === SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON) {
      pushAction(
        'check-shared-version',
        'Align singleton shared dependency versions in the same share scope',
        'shared',
      );
      pushAction(
        'check-shared-provider',
        'Check which host or remote registered each shared version',
        'shared',
      );
      return actions;
    }

    if (report.status !== 'error' && !report.summary.error) {
      return actions;
    }

    switch (report.errorCode) {
      case 'RUNTIME-001':
        pushAction(
          'check-remote-global',
          'Check the remote global name against the remoteEntry build output',
          'remote',
        );
        pushAction(
          'check-remote-entry',
          'Check that remoteEntry registers the expected container',
          'remote',
        );
        break;
      case 'RUNTIME-003':
        pushAction(
          'check-manifest-url',
          'Check the manifest URL and manifest JSON response',
          'host',
        );
        pushAction(
          'check-network',
          'Check network availability, CORS, and timeout for the manifest',
          'network',
        );
        break;
      case 'RUNTIME-013':
        pushAction(
          'check-manifest-url',
          'Check that the manifest response is valid Module Federation JSON',
          'remote',
        );
        break;
      case 'RUNTIME-004':
        pushAction(
          'check-host-remotes',
          'Check that the requested remote exists in host remotes',
          'host',
        );
        break;
      case 'RUNTIME-007':
        pushAction(
          'check-module-info',
          'Check deployment-provided __FEDERATION__.moduleInfo for the requested remote',
          'host',
        );
        pushAction(
          'check-host-remotes',
          'Check that the runtime remote name or alias matches moduleInfo',
          'host',
        );
        break;
      case 'RUNTIME-014':
        pushAction(
          'check-expose',
          'Check that the requested expose exists in the remote build output',
          'remote',
        );
        break;
      case 'RUNTIME-015':
        pushAction(
          'check-remote-entry',
          'Check the error thrown during remoteEntry init',
          'remote',
        );
        pushAction(
          'check-shared-provider',
          'Check share scope initialization data passed to the remote',
          'shared',
        );
        break;
      case 'RUNTIME-005':
      case 'RUNTIME-006':
        pushAction(
          'check-shared-provider',
          'Check that a compatible shared provider is available',
          'shared',
        );
        pushAction(
          'check-shared-version',
          'Compare requested shared version with available versions',
          'shared',
        );
        if (
          report.summary.error?.lifecycle === 'loadShareSync' ||
          report.shared?.reason === 'sync-async-boundary' ||
          report.shared?.eager === false
        ) {
          pushAction(
            'check-eager-config',
            'Check eager configuration or add an async boundary before sync shared consumption',
            'shared',
          );
        }
        break;
      case 'RUNTIME-008': {
        const resourceErrorType = getDiagnosisResourceErrorType(report);
        if (
          resourceErrorType === 'network' ||
          resourceErrorType === 'timeout'
        ) {
          pushAction(
            'check-network',
            'Check remoteEntry URL, CORS, status code, and timeout',
            'network',
          );
        }
        pushAction(
          'check-remote-entry',
          resourceErrorType === 'script-execution'
            ? 'Check remoteEntry execution errors in the remote build output'
            : 'Check that remoteEntry is reachable and serves JavaScript',
          resourceErrorType === 'network' || resourceErrorType === 'timeout'
            ? 'network'
            : 'remote',
        );
        break;
      }
      default:
        if (report.failedPhase === 'manifest') {
          pushAction(
            'check-manifest-url',
            'Check manifest loading and parsing',
            'host',
          );
        }
        if (report.failedPhase === 'remoteEntry') {
          pushAction(
            'check-remote-entry',
            'Check remoteEntry loading and initialization',
            'remote',
          );
        }
        if (report.failedPhase === 'expose') {
          pushAction(
            'check-expose',
            'Check that the requested expose exists in the remote',
            'remote',
          );
        }
        if (report.failedPhase === 'shared') {
          pushAction(
            'check-shared-provider',
            'Check shared dependency resolution',
            'shared',
          );
          if (
            report.shared?.requiredVersion !== undefined ||
            report.shared?.availableVersions?.length ||
            report.shared?.reason === 'version-mismatch'
          ) {
            pushAction(
              'check-shared-version',
              'Compare requested shared version with available versions',
              'shared',
            );
          }
          if (
            report.summary.error?.lifecycle === 'loadShareSync' ||
            report.shared?.reason === 'sync-async-boundary' ||
            report.shared?.eager === false
          ) {
            pushAction(
              'check-eager-config',
              'Check eager configuration or add an async boundary before sync shared consumption',
              'shared',
            );
          }
        }
    }

    if (
      report.moduleInfo &&
      !actions.some((action) => action.id === 'check-module-info')
    ) {
      pushAction(
        'check-module-info',
        'Check deployment-provided __FEDERATION__.moduleInfo for the requested remote',
        'host',
      );
    }

    if (!actions.length) {
      pushAction(
        'inspect-runtime-events',
        'Inspect the ordered observability events for the failed phase',
        ownerHint,
      );
    }

    return actions;
  };

  const createFactReport = (
    report: ObservabilityReport,
  ): ObservabilityFactReport => {
    const ownerHint = getDiagnosisOwnerHint(report);
    const warnings = createDiagnosisWarnings(report);

    return {
      title: getDiagnosisTitle(report),
      outcome: report.summary.outcome,
      status: report.status,
      ownerHint,
      failedPhase: report.failedPhase || report.summary.error?.failedPhase,
      errorCode: report.errorCode || report.summary.error?.errorCode,
      errorName: report.errorName || report.summary.error?.errorName,
      errorMessage: report.errorMessage || report.summary.error?.errorMessage,
      docLink: getDiagnosisDocLink(report),
      facts: createDiagnosisFacts(report, ownerHint),
      completedPhases: getCompletedPhases(report),
      pendingPhases: getPendingPhases(report),
      warnings: warnings.length ? warnings : undefined,
      actions: createDiagnosisActions(report, ownerHint),
    };
  };

  const refreshReportDerivedFields = (report: ObservabilityReport) => {
    report.summary = createReportSummary(report);
    refreshModuleInfoSummary(report);
    report.diagnosis = createFactReport(report);
  };

  const updateReport = (event: ObservabilityEvent) => {
    let report = reports.get(event.traceId);

    if (!report) {
      report = {
        traceId: event.traceId,
        instanceRef: event.instanceRef,
        status: event.status === 'error' ? 'error' : 'pending',
        requestId: event.requestId,
        requestAlias: event.requestAlias,
        hostName: event.hostName,
        runtimeVersion: event.runtimeVersion,
        remote: event.remote ? { ...event.remote } : undefined,
        shared: event.shared ? copyEvent(event).shared : undefined,
        expose: event.expose,
        sanitizedUrl: event.sanitizedUrl,
        startedAt: event.timestamp,
        updatedAt: event.timestamp,
        duration: 0,
        failedPhase: event.status === 'error' ? event.phase : undefined,
        errorCode: event.errorCode,
        errorName: event.errorName,
        errorMessage: event.errorMessage,
        errorStack: event.errorStack,
        ownerHint: event.ownerHint,
        retryable: event.retryable,
        errorContext: event.errorContext
          ? { ...event.errorContext }
          : undefined,
        loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
        bridge: copyBridgeInfo(event.bridge),
        events: [],
        summary: {
          eventCount: 0,
          recovered: false,
          loadCompleted: false,
          runtimeLoaded: false,
          sharedResolved: false,
          sharedRegistered: false,
          preloaded: false,
          componentLoaded: false,
          outcome: 'pending',
          lastPhase: undefined,
          phases: {},
          shared: undefined,
          flags: createEmptyPhaseCollection().flags,
          error: undefined,
        },
      };
      reports.set(event.traceId, report);
    }

    if (event.instanceRef) {
      report.instanceRef = event.instanceRef;
    }

    if (event.requestId) {
      report.requestId = event.requestId;
    }
    if (event.requestAlias) {
      report.requestAlias = event.requestAlias;
    }
    if (event.hostName) {
      report.hostName = event.hostName;
    }
    if (event.runtimeVersion) {
      report.runtimeVersion = event.runtimeVersion;
    }
    if (event.remote) {
      report.remote = { ...event.remote };
    }
    if (event.shared) {
      report.shared = copyEvent(event).shared;
    }
    if (event.expose) {
      report.expose = event.expose;
    }
    if (event.sanitizedUrl) {
      report.sanitizedUrl = event.sanitizedUrl;
    }
    if (event.errorStack) {
      report.errorStack = event.errorStack;
    }
    if (event.errorCode) {
      report.errorCode = event.errorCode;
    }
    if (event.errorName) {
      report.errorName = event.errorName;
    }
    if (event.errorMessage) {
      report.errorMessage = event.errorMessage;
    }
    if (event.ownerHint) {
      report.ownerHint = event.ownerHint;
    }
    if (event.retryable !== undefined) {
      report.retryable = event.retryable;
    }
    if (event.errorContext) {
      report.errorContext = { ...event.errorContext };
    }
    if (event.loadedBefore) {
      report.loadedBefore = copyLoadedBeforeInfo(event.loadedBefore);
    }
    if (event.bridge) {
      report.bridge = copyBridgeInfo(event.bridge);
    }

    report.events.push(event);
    report.updatedAt = event.timestamp;
    report.duration = Math.max(0, report.updatedAt - report.startedAt);

    const eventOutcome = getEventOutcome(event);

    if (eventOutcome === 'error') {
      report.status = 'error';
      if (shouldReplaceFailedPhase(report, event)) {
        report.failedPhase = event.phase;
      }
    } else if (eventOutcome === 'recovered') {
      report.status = 'success';
    } else if (eventOutcome === 'success' && report.status !== 'error') {
      report.status = 'success';
    }

    refreshReportDerivedFields(report);

    latestTraceId = event.traceId;
    if (event.instanceRef) {
      latestTraceByInstance.set(event.instanceRef, event.traceId);
    }
    trimEvents(report);
    return report;
  };

  const notifyEvent = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    try {
      options.onEvent?.(copyEvent(event), copyReport(report), {
        origin,
        instanceRef: event.instanceRef,
      });
    } catch {
      // Observability callbacks must not affect Module Federation loading.
    }
  };

  const notifyReport = (
    report: ObservabilityReport,
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    if (report.events[report.events.length - 1]?.status === 'start') {
      return;
    }

    try {
      options.onReport?.(copyReport(report), {
        origin,
        instanceRef: report.instanceRef,
      });
    } catch {
      // Observability callbacks must not affect Module Federation loading.
    }
  };

  const notifyRawError = (
    errorValue: unknown,
    event: ObservabilityEvent,
    report: ObservabilityReport,
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    if (!errorValue || !options.onRawError) {
      return;
    }

    try {
      options.onRawError(errorValue, {
        origin,
        instanceRef: event.instanceRef,
        event: copyEvent(event),
        report: copyReport(report),
      });
    } catch {
      // Raw error callbacks must not affect Module Federation loading.
    }
  };

  const notifyCollector = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
  ) => {
    if (!collectorOptions) {
      return;
    }

    const fetcher = (globalThis as { fetch?: ObservabilityFetch }).fetch;
    if (typeof fetcher !== 'function') {
      return;
    }

    try {
      const body = JSON.stringify({
        schemaVersion: 1,
        source: 'browser',
        kind: 'event',
        createdAt: Date.now(),
        event: copyEvent(event),
        report: copyReport(report),
      });

      void fetcher(getCollectorUrl(collectorOptions.port), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body,
        keepalive: body.length <= 64 * 1024,
        credentials: 'omit',
        mode: 'cors',
      }).catch((error) => {
        // The local collector is optional and must not affect MF loading.
        logger.debug('Failed to notify local observability collector.', error);
      });
    } catch (error) {
      // The local collector is optional and must not affect MF loading.
      logger.debug('Failed to notify local observability collector.', error);
    }
  };

  const notifyDevtools = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
  ) => {
    if (!devtoolsOptions) {
      return;
    }

    const poster = (globalThis as { postMessage?: unknown }).postMessage;
    if (typeof poster !== 'function') {
      return;
    }

    try {
      poster.call(
        globalThis,
        {
          schemaVersion: 1,
          source: devtoolsOptions.source,
          kind: 'event',
          createdAt: Date.now(),
          scope: browserGlobalScope || report.hostName,
          event: copyEvent(event),
          report: copyReport(report),
        },
        '*',
      );
    } catch {
      // Browser extension delivery is optional and must not affect MF loading.
    }
  };

  const createStateRemote = (
    value: unknown,
    fallbackName?: string,
  ): ObservabilityRuntimeStateRemote | undefined => {
    if (typeof value === 'string') {
      return {
        name: fallbackName || sanitizeText(value, 120) || 'unknown',
        entry: sanitizeUrl(value),
      };
    }
    if (!isRecord(value)) {
      return fallbackName ? { name: fallbackName } : undefined;
    }

    const name =
      sanitizeText(getObjectValue(value, 'name'), 120) ||
      sanitizeText(fallbackName, 120);
    if (!name) {
      return undefined;
    }

    return omitUndefinedFields({
      name,
      alias: sanitizeText(getObjectValue(value, 'alias'), 120),
      version: sanitizeText(getObjectValue(value, 'version'), 120),
      entry: sanitizeUrl(
        sanitizeText(
          getObjectValue(value, 'entry') ||
            getObjectValue(value, 'remoteEntry') ||
            getObjectValue(value, 'manifestUrl'),
          320,
        ),
      ),
      entryGlobalName: sanitizeText(
        getObjectValue(value, 'entryGlobalName') ||
          getObjectValue(value, 'globalName'),
        120,
      ),
      type: sanitizeText(getObjectValue(value, 'type'), 80),
    });
  };

  const getDeclaredRemotes = (origin: ObservabilityRuntimeOrigin) => {
    const remotes = origin.options?.remotes;
    const values = Array.isArray(remotes)
      ? remotes.map((value) => [undefined, value] as const)
      : isRecord(remotes)
        ? Object.entries(remotes)
        : [];

    return values
      .map(([name, value]) => createStateRemote(value, name))
      .filter(
        (remote): remote is ObservabilityRuntimeStateRemote =>
          remote !== undefined,
      );
  };

  const getLoadedProducerRemotes = (origin: ObservabilityRuntimeOrigin) =>
    getModuleCacheEntries(origin.moduleCache)
      .map((module) =>
        createStateRemote(
          isRecord(module) ? getObjectValue(module, 'remoteInfo') : undefined,
        ),
      )
      .filter(
        (remote): remote is ObservabilityRuntimeStateRemote =>
          remote !== undefined,
      );

  const getShareScopeSummaries = (origin: ObservabilityRuntimeOrigin) =>
    Object.entries(getOriginShareScopeMap(origin)).map(([name, scope]) => {
      const rawSharedNames = Object.keys(scope || {}).sort();
      const sharedEntries = rawSharedNames.slice(0, 100).map((rawName) => ({
        rawName,
        name: sanitizeText(rawName, 160) || 'unknown',
      }));
      return {
        name: sanitizeText(name, 120) || 'default',
        sharedCount: rawSharedNames.length,
        sharedNames: sharedEntries.map((entry) => entry.name),
        shared: sharedEntries.map((entry) => ({
          name: entry.name,
          versions: Object.entries(scope?.[entry.rawName] || {})
            .slice(0, 20)
            .map(([version, shared]) =>
              omitUndefinedFields({
                version: sanitizeText(version, 120) || version,
                provider: sanitizeText(shared.from, 160),
                loaded: shared.loaded === true || undefined,
                singleton: shared.shareConfig?.singleton || undefined,
                eager: shared.shareConfig?.eager || undefined,
                strategy: sanitizeText(shared.strategy, 80),
              }),
            ),
        })),
      };
    });

  const updateBridgeState = (
    origin: ObservabilityRuntimeOrigin,
    bridge: ObservabilityBridgeInfo,
    signal: 'start' | 'invoked' | 'result' | 'commit',
  ) => {
    const instanceRef = getInstanceRef(origin);
    if (!instanceRef) {
      return;
    }
    let states = bridgeStatesByInstance.get(instanceRef);
    if (!states) {
      states = new Map();
      bridgeStatesByInstance.set(instanceRef, states);
    }
    const key = `${bridge.bridgeId}\u0000${bridge.side}`;
    const previous = states.get(key);
    let status = previous?.status || 'idle';
    if (signal === 'start') {
      if (bridge.operation === 'destroy') {
        status = 'destroying';
      } else if (
        bridge.operation === 'render' ||
        bridge.operation === 'update'
      ) {
        status = 'rendering';
      }
    } else if (signal === 'result') {
      if (bridge.outcome === 'error') {
        status = 'error';
      } else if (bridge.operation === 'destroy') {
        status = 'destroyed';
      } else if (
        bridge.operation === 'render' ||
        bridge.operation === 'update'
      ) {
        status = 'rendered';
      }
    } else if (signal === 'commit') {
      status = 'rendered';
    }

    states.set(key, {
      bridgeId: bridge.bridgeId,
      side: bridge.side,
      framework: bridge.framework,
      moduleName: bridge.moduleName || previous?.moduleName,
      remote: bridge.remote || previous?.remote,
      expose: bridge.expose || previous?.expose,
      status,
      lastOperation: bridge.operation,
      lastOperationId: bridge.operationId,
      lastOperationAt: bridge.endedAt || bridge.startedAt,
      commitObserved: signal === 'commit' || previous?.commitObserved === true,
      routeSyncObserved:
        bridge.operation === 'route-sync' ||
        previous?.routeSyncObserved === true,
    });
  };

  const getBridgeSummary = (
    origin: ObservabilityRuntimeOrigin,
    instanceRef: string,
  ): ObservabilityRuntimeStateInstance['bridge'] => {
    if (!isRecord(origin.bridgeHook)) {
      return undefined;
    }
    const lifecycle = getObjectValue(origin.bridgeHook, 'lifecycle');
    const states = Array.from(
      bridgeStatesByInstance.get(instanceRef)?.values() || [],
    )
      .sort(
        (left, right) =>
          (right.lastOperationAt || 0) - (left.lastOperationAt || 0),
      )
      .map((state) => ({ ...state }));
    const latest = states[0];
    return {
      available: true,
      lifecycleCount: isRecord(lifecycle)
        ? Object.keys(lifecycle).length
        : undefined,
      framework: latest?.framework,
      moduleName: latest?.moduleName,
      remote: latest?.remote,
      expose: latest?.expose,
      status: latest?.status || 'idle',
      lastOperationAt: latest?.lastOperationAt,
      commitObserved: states.some((state) => state.commitObserved),
      routeSyncObserved: states.some((state) => state.routeSyncObserved),
      states,
    };
  };

  const getRuntimeModuleInfo = (): ObservabilityRuntimeModuleInfo[] => {
    const moduleInfo = getFederationGlobal()?.moduleInfo || {};
    return Object.entries(moduleInfo)
      .map(([key, value]) => {
        const record = isRecord(value) ? value : {};
        const rawRemotes = getObjectValue(record, 'remotes');
        const remoteValues = Array.isArray(rawRemotes)
          ? rawRemotes.map((remote) => [undefined, remote] as const)
          : isRecord(rawRemotes)
            ? Object.entries(rawRemotes)
            : [];
        const remotes = remoteValues
          .map(([name, remote]) => createStateRemote(remote, name))
          .filter(
            (remote): remote is ObservabilityRuntimeStateRemote =>
              remote !== undefined,
          );
        return omitUndefinedFields({
          key: sanitizeText(key, 160) || key,
          name: sanitizeText(getObjectValue(record, 'name'), 120),
          version: sanitizeText(
            getObjectValue(record, 'version') ||
              getObjectValue(record, 'buildVersion'),
            120,
          ),
          entry: sanitizeUrl(
            sanitizeText(
              getObjectValue(record, 'entry') ||
                getObjectValue(record, 'remoteEntry') ||
                getObjectValue(record, 'manifestUrl'),
              320,
            ),
          ),
          tag: sanitizeText(getObjectValue(record, 'tag'), 120),
          remotes: remotes.length ? remotes : undefined,
        });
      })
      .slice(0, MAX_MODULE_INFO_ENTRIES);
  };

  const getRuntimeFrame = () => {
    try {
      return typeof window === 'undefined'
        ? undefined
        : window === window.top
          ? 'top'
          : 'child';
    } catch {
      return 'child';
    }
  };

  const getRuntimeStateSnapshot = (): ObservabilityRuntimeState => {
    const activeInstances = getActiveRuntimeInstances();
    activeInstances.forEach((instance) => registerRuntimeInstance(instance));
    const moduleInfo = getRuntimeModuleInfo();
    const instanceOrigins = Array.from(instancesByRef.entries());
    const instanceDrafts = instanceOrigins.map(([instanceRef, origin]) => ({
      instanceRef,
      origin,
      name:
        sanitizeText(origin.name, 120) ||
        sanitizeText(origin.options?.name, 120),
      optionsName: sanitizeText(origin.options?.name, 120),
      optionsVersion: sanitizeText(origin.options?.version, 120),
      runtimeVersion: sanitizeText(origin.version, 80),
      remotes: getDeclaredRemotes(origin),
      loadedProducers: getLoadedProducerRemotes(origin),
      consumerEvidence: [] as string[],
      producerEvidence: [] as string[],
    }));

    instanceDrafts.forEach((draft) => {
      const matchingModuleInfo = moduleInfo.filter((info) => {
        const names = [draft.name, draft.optionsName].filter(
          (name): name is string => Boolean(name),
        );
        return names.some(
          (name) =>
            info.name === name ||
            info.key === name ||
            (info.key.includes(name) &&
              (!draft.optionsVersion ||
                info.version === draft.optionsVersion ||
                info.key.includes(draft.optionsVersion))),
        );
      });
      if (draft.remotes.length) {
        draft.consumerEvidence.push('options.remotes');
      }
      if (draft.loadedProducers.length) {
        draft.consumerEvidence.push('moduleCache.remoteInfo');
      }
      if (matchingModuleInfo.some((info) => info.remotes?.length)) {
        draft.consumerEvidence.push('moduleInfo.remotes');
      }
      if (matchingModuleInfo.length) {
        draft.producerEvidence.push('moduleInfo');
      }
    });

    const relationships: ObservabilityRuntimeRelationship[] = [];
    instanceDrafts.forEach((consumer) => {
      consumer.loadedProducers.forEach((remote) => {
        const matchingModuleInfo = moduleInfo.filter(
          (info) =>
            info.name === remote.name ||
            info.key === remote.name ||
            Boolean(remote.entry && info.entry === remote.entry) ||
            Boolean(remote.version && info.version === remote.version),
        );
        const candidates = instanceDrafts.filter((producer) => {
          if (producer.instanceRef === consumer.instanceRef) {
            return false;
          }
          const names = new Set(
            [producer.name, producer.optionsName].filter(
              (name): name is string => Boolean(name),
            ),
          );
          const directNameMatches =
            names.has(remote.name) ||
            Boolean(remote.alias && names.has(remote.alias));
          const moduleInfoMatches = matchingModuleInfo.some(
            (info) =>
              Boolean(info.name && names.has(info.name)) ||
              names.has(info.key) ||
              Boolean(info.version && producer.optionsVersion === info.version),
          );
          const versionMatches =
            !remote.version ||
            !producer.optionsVersion ||
            producer.optionsVersion === remote.version;
          return (directNameMatches || moduleInfoMatches) && versionMatches;
        });
        const status: ObservabilityRelationshipStatus =
          candidates.length === 1
            ? 'resolved'
            : candidates.length > 1
              ? 'ambiguous'
              : 'unresolved';
        candidates.forEach((candidate) => {
          if (!candidate.producerEvidence.includes('consumer.moduleCache')) {
            candidate.producerEvidence.push('consumer.moduleCache');
          }
        });
        relationships.push(
          omitUndefinedFields({
            consumerInstanceRef: consumer.instanceRef,
            producerInstanceRef:
              candidates.length === 1 ? candidates[0].instanceRef : undefined,
            candidateProducerInstanceRefs:
              candidates.length > 1
                ? candidates.map((candidate) => candidate.instanceRef)
                : undefined,
            remote,
            evidence: ['moduleCache.remoteInfo'],
            status,
          }),
        );
      });
    });

    const instances = instanceDrafts.map(
      (draft): ObservabilityRuntimeStateInstance => {
        const isConsumer = draft.consumerEvidence.length > 0;
        const isProducer = draft.producerEvidence.length > 0;
        const role: ObservabilityInstanceRole =
          isConsumer && isProducer
            ? 'mixed'
            : isConsumer
              ? 'consumer'
              : isProducer
                ? 'producer'
                : 'unknown';
        return omitUndefinedFields({
          instanceRef: draft.instanceRef,
          name: draft.name,
          optionsName: draft.optionsName,
          optionsVersion: draft.optionsVersion,
          runtimeVersion: draft.runtimeVersion,
          role,
          roleEvidence: {
            consumer: [...draft.consumerEvidence],
            producer: [...draft.producerEvidence],
          },
          remotes: draft.remotes,
          loadedProducers: draft.loadedProducers,
          shareScopes: getShareScopeSummaries(draft.origin),
          bridge: getBridgeSummary(draft.origin, draft.instanceRef),
          active: activeInstances.includes(
            draft.origin as ObservabilityRuntimeInstanceLike,
          ),
        });
      },
    );
    const hasLateBinding = lateBoundInstanceRefs.size > 0;
    const hasIncompleteHistory = hasLateBinding || historyCleared;
    const hasStableSharedRuntime = instanceDrafts.some((draft) =>
      supportsRuntimeObservability(draft.origin),
    );
    const hasSharedState = instances.some(
      (instance) => instance.shareScopes.length > 0,
    );
    const hasRemoteSignals = events.some((event) => Boolean(event.remote));
    const hasSharedSignals = events.some((event) => Boolean(event.shared));
    const hasDetailedSharedSignals = events.some(
      (event) =>
        Boolean(event.shared?.selectionReason) ||
        Boolean(event.shared?.registration),
    );
    const hasDetailedSharedHooks = instanceDrafts.some((draft) =>
      Boolean(
        draft.origin.sharedHandler?.hooks?.lifecycle?.['afterRegisterShare'],
      ),
    );
    const hasBridge = instances.some((instance) => instance.bridge?.available);
    const bridgeEvents = events.filter((event) => Boolean(event.bridge));
    const hasBridgeSignals = bridgeEvents.length > 0;
    const hasBridgeCommit = bridgeEvents.some(
      (event) => event.phase === 'bridge-commit',
    );
    const hasBridgeRoute = bridgeEvents.some(
      (event) => event.bridge?.operation === 'route-sync',
    );
    const traceCompleteness = hasIncompleteHistory ? 'partial' : 'complete';
    const hasResourceLifecycle = instanceDrafts.some((draft) =>
      supportsResourceLifecycle(draft.origin),
    );
    const remoteTraceCompleteness =
      hasIncompleteHistory || !hasResourceLifecycle ? 'partial' : 'complete';

    return omitUndefinedFields({
      schemaVersion: 1,
      observedAt: Date.now(),
      scope: {
        name: browserGlobalScope || normalizeScope(options.browser?.scope),
        realm: 'current',
        frame: getRuntimeFrame(),
      },
      completeness: {
        currentState: 'complete',
        history: hasIncompleteHistory ? 'partial' : 'complete',
        historyCleared,
        lateBoundInstanceRefs: Array.from(lateBoundInstanceRefs),
        recommendation: hasIncompleteHistory
          ? 'Reload or reopen the page to capture complete runtime history.'
          : undefined,
      },
      capabilities: {
        instanceState: {
          available: true,
          completeness: 'complete',
        },
        remoteTrace: {
          available: hasRemoteSignals || boundInstanceRefs.size > 0,
          completeness: remoteTraceCompleteness,
          reason: !hasResourceLifecycle
            ? 'Runtime resource completion hooks are unavailable; remote resource history may be incomplete.'
            : hasRemoteSignals
              ? undefined
              : 'No remote lifecycle signal has been observed yet.',
        },
        sharedState: {
          available: hasSharedState,
          completeness: hasSharedState ? 'complete' : 'unavailable',
        },
        sharedTrace: {
          available: hasStableSharedRuntime && hasSharedSignals,
          completeness:
            hasStableSharedRuntime && hasSharedSignals
              ? hasDetailedSharedHooks && hasDetailedSharedSignals
                ? traceCompleteness
                : 'partial'
              : 'unavailable',
          reason: hasStableSharedRuntime
            ? hasSharedSignals
              ? hasDetailedSharedHooks && hasDetailedSharedSignals
                ? undefined
                : 'Shared history is available, but detailed registration or selection results are missing.'
              : 'No shared lifecycle signal has been observed yet.'
            : 'Shared tracing requires a stable runtime version of 2.5.0 or newer.',
        },
        bridgeTrace: {
          available: hasBridgeSignals,
          completeness: !hasBridgeSignals
            ? 'unavailable'
            : hasIncompleteHistory || !hasBridgeCommit || !hasBridgeRoute
              ? 'partial'
              : 'complete',
          reason: !hasBridgeSignals
            ? hasBridge
              ? 'Bridge is present, but no Bridge lifecycle signal has been observed.'
              : 'Bridge is not present on an observed instance.'
            : [
                hasIncompleteHistory ? 'runtime history is incomplete' : '',
                !hasBridgeCommit
                  ? 'no framework commit signal was observed'
                  : '',
                !hasBridgeRoute ? 'no route sync signal was observed' : '',
              ]
                .filter(Boolean)
                .join('; ') || undefined,
        },
      },
      instances,
      relationships,
      moduleInfo,
    });
  };

  const getEventsSnapshot = () => events.map(copyEvent);

  const getTraceIdsSnapshot = () => Array.from(reports.keys());

  const getReportTimeline = () =>
    Array.from(reports.values()).sort((left, right) => {
      if (right.updatedAt !== left.updatedAt) {
        return right.updatedAt - left.updatedAt;
      }

      return right.startedAt - left.startedAt;
    });

  const matchesReportValue = (
    value: string | undefined,
    expected: string | undefined,
  ) => {
    if (!value || !expected) {
      return false;
    }

    const normalizedValue = value.toLowerCase();
    const normalizedExpected = expected.toLowerCase();

    return (
      normalizedValue === normalizedExpected ||
      normalizedValue.includes(normalizedExpected)
    );
  };

  const matchesReportQuery = (
    report: ObservabilityReport,
    query: ObservabilityReportQuery,
  ) => {
    if (query.traceId && report.traceId !== query.traceId) {
      return false;
    }
    if (query.instanceRef && report.instanceRef !== query.instanceRef) {
      return false;
    }
    if (query.status && report.status !== query.status) {
      return false;
    }
    if (query.outcome && report.summary.outcome !== query.outcome) {
      return false;
    }
    if (
      query.remote &&
      ![
        report.remote?.name,
        report.remote?.alias,
        report.remote?.entry,
        report.requestId,
        report.requestAlias,
        report.sanitizedUrl,
      ].some((value) => matchesReportValue(value, query.remote))
    ) {
      return false;
    }
    if (
      query.expose &&
      ![report.expose, report.requestId].some((value) =>
        matchesReportValue(value, query.expose),
      )
    ) {
      return false;
    }
    if (
      query.shared &&
      ![report.shared?.name].some((value) =>
        matchesReportValue(value, query.shared),
      )
    ) {
      return false;
    }

    return true;
  };

  const getReportsSnapshot = (options: ObservabilityReportListOptions = {}) => {
    const limit = normalizeQueryLimit(options.limit);
    const timeline = getReportTimeline();

    return (limit ? timeline.slice(0, limit) : timeline).map(copyReport);
  };

  const findReportsSnapshot = (query: ObservabilityReportQuery = {}) => {
    const limit = normalizeQueryLimit(query.limit);
    const matchedReports = getReportTimeline().filter((report) =>
      matchesReportQuery(report, query),
    );

    return (limit ? matchedReports.slice(0, limit) : matchedReports).map(
      copyReport,
    );
  };

  const getLatestReportSnapshot = () => {
    if (!latestTraceId) {
      return undefined;
    }

    const report = reports.get(latestTraceId);
    return report ? copyReport(report) : undefined;
  };

  const getReportSnapshot = (traceId: string) => {
    const report = reports.get(traceId);
    return report ? copyReport(report) : undefined;
  };

  const exportReportSnapshot = (traceId?: string) =>
    traceId ? getReportSnapshot(traceId) : getLatestReportSnapshot();

  const openRuntimeAdapter = createOpenRuntimeObservabilityAdapter(
    options.openRuntime,
    {
      getReports: getReportsSnapshot,
      findReports: findReportsSnapshot,
      getLatestReport: getLatestReportSnapshot,
      getReport: getReportSnapshot,
      exportReport: exportReportSnapshot,
      getRuntimeState: getRuntimeStateSnapshot,
    },
  );

  const createBrowserReader = (): ObservabilityBrowserReader => ({
    getEvents: getEventsSnapshot,
    getTraceIds: getTraceIdsSnapshot,
    getReports: getReportsSnapshot,
    findReports: findReportsSnapshot,
    getLatestReport: getLatestReportSnapshot,
    getReport: getReportSnapshot,
    exportReport: exportReportSnapshot,
    getRuntimeState: getRuntimeStateSnapshot,
  });

  const shouldExposeBrowserGlobal = () => options.browser?.enabled === true;

  const ensureBrowserGlobal = (origin?: ObservabilityRuntimeOrigin) => {
    if (!shouldExposeBrowserGlobal()) {
      return;
    }

    const federationGlobal = getFederationGlobal();
    if (!federationGlobal) {
      return;
    }

    const scope = normalizeScope(
      options.browser?.scope || origin?.options?.name || 'default',
    );
    const reader = createBrowserReader();

    const readers = federationGlobal.__OBSERVABILITY__ || {};
    federationGlobal.__OBSERVABILITY__ = readers;
    browserGlobalScope = scope;

    try {
      Object.defineProperty(readers, scope, {
        value: reader,
        configurable: true,
        enumerable: true,
      });
    } catch {
      readers[scope] = reader;
    }
  };

  const shouldUseConsole = () => options.console !== false;

  const shouldUseDevelopmentChannels = () => {
    if (shouldUseMinimalBrowserConsole()) {
      return false;
    }

    if (shouldForceDevelopmentChannels) {
      return true;
    }

    if (typeof process === 'undefined' || !process.env) {
      return true;
    }

    return process.env['NODE_ENV'] !== 'production';
  };

  const shouldNotifyCollector = () => Boolean(collectorOptions);

  const shouldNotifyDevtools = () => shouldUseDevelopmentChannels();

  const shouldUseMinimalBrowserConsole = () =>
    options.browser?.mode === 'production';

  const shouldUseStartTrace = () =>
    options.trace?.printStart ??
    (options.browser?.enabled === true && !shouldUseMinimalBrowserConsole());

  const shouldPrintStartConsole = (event: ObservabilityEvent) =>
    shouldUseStartTrace() &&
    event.status === 'start' &&
    (event.phase === 'loadRemote' || event.phase === 'shared') &&
    shouldUseConsole();

  const shouldRecordStartTrace = (input: ObservabilityRuntimeEventInput) =>
    shouldUseStartTrace() &&
    input.status === 'start' &&
    (input.phase === 'loadRemote' || input.phase === 'shared');

  const shouldCollectLoadedBefore = (error?: unknown) =>
    Boolean(error) ||
    (level === 'verbose' && !shouldUseMinimalBrowserConsole());

  const getBrowserReadCommand = (traceId: string) => {
    if (!browserGlobalScope) {
      return undefined;
    }

    return `window.__FEDERATION__.__OBSERVABILITY__[${JSON.stringify(
      browserGlobalScope,
    )}].getReport(${JSON.stringify(traceId)})`;
  };

  const emitConsoleHint = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
    rawError?: unknown,
  ) => {
    if (
      getEventOutcome(event) !== 'error' ||
      !shouldUseConsole() ||
      consoleReportedTraceIds.has(report.traceId)
    ) {
      return;
    }

    consoleReportedTraceIds.add(report.traceId);

    if (shouldUseMinimalBrowserConsole()) {
      const lines = [
        '[Module Federation] Observability report generated',
        `traceId: ${report.traceId}`,
      ];

      if (report.errorCode) {
        lines.push(`errorCode: ${report.errorCode}`);
      }

      try {
        console.error(lines.join('\n'));
      } catch {
        // Console output is best-effort observability only.
      }
      return;
    }

    const lines = [
      '[Module Federation] Observability report generated',
      `traceId: ${report.traceId}`,
      `phase: ${report.failedPhase || event.phase}`,
    ];

    if (report.requestId) {
      lines.push(`requestId: ${report.requestId}`);
    }
    if (report.requestAlias) {
      lines.push(`requestAlias: ${report.requestAlias}`);
    }
    if (report.errorCode) {
      lines.push(`errorCode: ${report.errorCode}`);
    }
    if (report.shared?.name) {
      lines.push(`shared: ${report.shared.name}`);
    }

    const browserReadCommand = getBrowserReadCommand(report.traceId);
    if (browserReadCommand) {
      lines.push(`read: ${browserReadCommand}`);
    } else {
      lines.push('read: enable browser output or use onReport(report)');
    }

    const rawStack = getRawStack(rawError);
    if (options.printRawStack === true && rawStack) {
      lines.push('rawStack:', rawStack);
    }

    try {
      console.error(lines.join('\n'));
    } catch {
      // Console output is best-effort observability only.
    }
  };

  const emitStartConsoleHint = (
    event: ObservabilityEvent,
    report: ObservabilityReport,
  ) => {
    if (!shouldPrintStartConsole(event)) {
      return;
    }

    const startKey = [
      event.traceId,
      event.phase,
      event.requestId || event.shared?.name || event.remote?.name || '',
      event.lifecycle || '',
    ].join('|');
    if (consoleReportedStartKeys.has(startKey)) {
      return;
    }
    consoleReportedStartKeys.add(startKey);

    const lines = [
      '[Module Federation] Observability trace started',
      `traceId: ${report.traceId}`,
      `phase: ${event.phase}`,
    ];

    if (event.requestId) {
      lines.push(`requestId: ${event.requestId}`);
    }
    if (event.requestAlias) {
      lines.push(`requestAlias: ${event.requestAlias}`);
    }
    if (event.remote?.name) {
      lines.push(`remote: ${event.remote.name}`);
    }
    if (event.shared?.name) {
      lines.push(`shared: ${event.shared.name}`);
    }
    if (event.lifecycle) {
      lines.push(`lifecycle: ${event.lifecycle}`);
    }

    const browserReadCommand = getBrowserReadCommand(report.traceId);
    if (browserReadCommand) {
      lines.push(`read: ${browserReadCommand}`);
    } else {
      lines.push(
        'read: enable browser output or use getReports({ limit: 10 })',
      );
    }

    try {
      console.info(lines.join('\n'));
    } catch {
      // Console output is best-effort observability only.
    }
  };

  const prepareOutputChannels = (origin: ObservabilityRuntimeOrigin) => {
    browserGlobalScope = undefined;
    ensureBrowserGlobal(origin);
  };

  const prepareRuntimeOrigin = (origin: ObservabilityRuntimeOrigin) => {
    if (!isEnabled()) {
      return false;
    }

    lastRuntimeOrigin = origin;
    registerRuntimeInstance(origin);
    prepareOutputChannels(origin);
    return true;
  };

  const recordEvent = (
    input: ObservabilityRuntimeEventInput,
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    if (suppressRuntimeEvents) {
      return undefined;
    }

    const effectiveInput = {
      ...input,
      instanceRef: input.instanceRef || getInstanceRef(origin),
    };
    const traceId = resolveTraceId(effectiveInput);
    const event = normalizeEvent(effectiveInput, traceId, origin);
    applyPhaseDuration(event);
    updateTraceMaps(event);

    if (
      !shouldRecordEvent(level, effectiveInput) &&
      !shouldRecordStartTrace(effectiveInput)
    ) {
      return undefined;
    }

    events.push(event);
    const report = updateReport(event);
    openRuntimeAdapter?.syncReport(report, {
      origin,
      instanceRef: event.instanceRef,
    });
    emitStartConsoleHint(event, report);
    emitConsoleHint(event, report, input.error);
    if (shouldNotifyCollector()) {
      notifyCollector(event, report);
    }
    if (shouldNotifyDevtools()) {
      notifyDevtools(event, report);
    }
    notifyRawError(effectiveInput.error, event, report, origin);
    notifyEvent(event, report, origin);
    notifyReport(report, origin);
    return event;
  };

  const markComponentLoadedFor = (
    markOptions: MarkComponentLoadedOptions = {},
    origin?: ObservabilityRuntimeOrigin,
  ) => {
    if (options.enabled === false || !runtimeObservabilityEnabled) {
      return undefined;
    }

    const instanceRef = getInstanceRef(origin);
    const traceId =
      markOptions.traceId ||
      (markOptions.requestId
        ? traceByRequest.get(
            getTraceMapKey(
              instanceRef,
              sanitizeRequestId(markOptions.requestId) || '',
            ),
          )
        : undefined) ||
      (instanceRef ? latestTraceByInstance.get(instanceRef) : latestTraceId) ||
      createTraceId({
        phase: 'component',
        status: 'success',
        requestId: markOptions.requestId,
      });

    return recordEvent(
      {
        traceId,
        instanceRef,
        phase: 'component',
        status: 'success',
        requestId: markOptions.requestId,
        componentName: markOptions.componentName,
        metadata: markOptions.metadata,
        eventName: COMPONENT_BUSINESS_LOADED_EVENT,
        message: COMPONENT_BUSINESS_LOADED_EVENT,
        source: 'business',
      },
      origin,
    );
  };

  const markComponentLoaded = (markOptions: MarkComponentLoadedOptions = {}) =>
    markComponentLoadedFor(markOptions, lastRuntimeOrigin);

  const getReactForOrigin = async (
    origin: ObservabilityRuntimeOrigin,
  ): Promise<ObservabilityReactLike | undefined> => {
    const previousSuppressRuntimeEvents = suppressRuntimeEvents;
    suppressRuntimeEvents = true;
    try {
      let reactFactory: false | (() => unknown) | undefined;
      try {
        reactFactory = origin.loadShareSync?.('react');
      } catch {
        reactFactory = undefined;
      }

      if (typeof reactFactory !== 'function') {
        reactFactory = await origin.loadShare?.('react');
      }

      if (typeof reactFactory !== 'function') {
        return undefined;
      }

      return resolveReactLike(reactFactory());
    } catch {
      return undefined;
    } finally {
      suppressRuntimeEvents = previousSuppressRuntimeEvents;
    }
  };

  const getReactWrapPolicy = (loadArgs: ObservabilityRemoteLoadArgs) => {
    if (
      options.react?.enabled === false ||
      options.react?.injectLoadedCallback !== true
    ) {
      return undefined;
    }

    const remoteIds = options.react.remoteIds || [];
    if (!remoteIds.length) {
      return {
        allowAnonymousComponent: false,
      };
    }

    const normalizeRemoteId = (value: string) =>
      value.replace(/\/\.\//g, '/').replace(/^\.\//, '');
    const expectedRemoteIds = new Set(remoteIds.map(normalizeRemoteId));
    const candidates = new Set<string>();
    const addCandidate = (value: string | undefined) => {
      if (!value) {
        return;
      }
      candidates.add(value);
      candidates.add(normalizeRemoteId(value));
    };
    const exposeValues = [loadArgs.expose];
    if (loadArgs.expose?.startsWith('./')) {
      exposeValues.push(loadArgs.expose.slice(2));
    }
    const remoteNames = [
      loadArgs.pkgNameOrAlias,
      loadArgs.remote?.alias,
      loadArgs.remote?.name,
    ];

    addCandidate(loadArgs.id);
    addCandidate(loadArgs.expose);
    remoteNames.forEach((remoteName) => {
      exposeValues.forEach((expose) => {
        addCandidate(remoteName && expose ? `${remoteName}/${expose}` : '');
      });
    });

    const matched = Array.from(candidates).some((candidate) =>
      expectedRemoteIds.has(candidate),
    );

    return matched
      ? {
          allowAnonymousComponent: true,
        }
      : undefined;
  };

  const createReactComponentWrapper = (
    component: unknown,
    loadArgs: ObservabilityRemoteLoadArgs,
    wrapPolicy: { allowAnonymousComponent: boolean },
    react: ObservabilityReactLike | undefined,
  ) => {
    const target = resolveReactComponentTarget(
      component,
      options.react?.defaultExportMode ||
        (wrapPolicy.allowAnonymousComponent ? 'component' : 'preserve'),
      wrapPolicy.allowAnonymousComponent,
    );
    if (!target) {
      return undefined;
    }

    const componentName = getReactComponentName(
      target.component,
      loadArgs.expose || loadArgs.id,
    );
    const originalComponent = target.component;

    const ObservedRemoteComponent = (props: Record<string, unknown>) => {
      const incomingProps = isRecord(props) ? props : {};
      const originalLoadedCallback = getObjectValue(
        incomingProps,
        ON_MF_REMOTE_LOADED_PROP,
      );
      const onMFRemoteLoaded: OnMFRemoteLoaded = (loadedOptions = {}) => {
        markComponentLoadedFor(
          {
            requestId: loadArgs.id,
            componentName: loadedOptions.componentName || componentName,
            metadata: loadedOptions.metadata,
          },
          loadArgs.origin,
        );

        if (typeof originalLoadedCallback === 'function') {
          (originalLoadedCallback as OnMFRemoteLoaded)(loadedOptions);
        }
      };

      const nextProps = {
        ...incomingProps,
        [ON_MF_REMOTE_LOADED_PROP]: onMFRemoteLoaded,
      };

      if (react) {
        return react.createElement(originalComponent, nextProps);
      }

      return (
        originalComponent as (nextProps: Record<string, unknown>) => unknown
      )(nextProps);
    };

    ObservedRemoteComponent.displayName = `ObservedRemote(${componentName})`;
    copyComponentStatics(
      ObservedRemoteComponent as unknown as Record<string, unknown>,
      originalComponent as unknown as Record<string, unknown>,
    );

    return target.createResult(ObservedRemoteComponent);
  };

  const wrapReactComponent = async (
    component: unknown,
    loadArgs: ObservabilityRemoteLoadArgs,
  ) => {
    const wrapPolicy = getReactWrapPolicy(loadArgs);
    if (!wrapPolicy) {
      return undefined;
    }

    return createReactComponentWrapper(
      component,
      loadArgs,
      wrapPolicy,
      await getReactForOrigin(loadArgs.origin),
    );
  };

  const wrapReactComponentFactory = async (
    factory: unknown,
    loadArgs: ObservabilityRemoteLoadArgs,
  ) => {
    const wrapPolicy = getReactWrapPolicy(loadArgs);
    if (!wrapPolicy || typeof factory !== 'function') {
      return undefined;
    }

    const react = await getReactForOrigin(loadArgs.origin);
    const originalFactory = factory as (...args: unknown[]) => unknown;

    return (...factoryArgs: unknown[]) => {
      const moduleOrPromise = originalFactory(...factoryArgs);
      if (
        moduleOrPromise &&
        typeof (moduleOrPromise as Promise<unknown>).then === 'function'
      ) {
        return (moduleOrPromise as Promise<unknown>).then((module) => {
          return (
            createReactComponentWrapper(module, loadArgs, wrapPolicy, react) ||
            module
          );
        });
      }

      return (
        createReactComponentWrapper(
          moduleOrPromise,
          loadArgs,
          wrapPolicy,
          react,
        ) || moduleOrPromise
      );
    };
  };

  const resolveBridgeHookArgs = (
    args: ObservabilityBridgeHookArgs,
    signal: 'start' | 'invoked' | 'result' | 'commit',
    origin: ObservabilityRuntimeOrigin,
  ): LegacyObservabilityBridgeHookArgs | undefined => {
    const hookArgs = args as unknown as Record<string, unknown>;
    if (
      typeof hookArgs.operationId === 'string' &&
      typeof hookArgs.bridgeId === 'string'
    ) {
      return args as LegacyObservabilityBridgeHookArgs;
    }

    const context = (isRecord(hookArgs.context)
      ? hookArgs.context
      : hookArgs) as unknown as BridgeOperationContext;
    if (
      !context ||
      !isRecord(context.args) ||
      !context.side ||
      !context.framework ||
      !context.operation
    ) {
      return undefined;
    }

    const operationKey = isRecord(context.operationKey)
      ? context.operationKey
      : context.args;
    const target =
      (typeof context.args.dom === 'object' && context.args.dom !== null) ||
      typeof context.args.dom === 'function'
        ? (context.args.dom as object)
        : undefined;
    const fallbackKey = [
      getInstanceRef(origin) || '',
      context.side,
      context.framework,
      context.moduleName || '',
    ].join('\u0000');
    let bridgeId = target
      ? bridgeIdsByTarget.get(target)
      : bridgeIdsByFallback.get(fallbackKey);
    if (!bridgeId) {
      bridgeCounter += 1;
      bridgeId = `bridge-${bridgeCounter}`;
    }
    if (target) {
      bridgeIdsByTarget.set(target, bridgeId);
    }
    bridgeIdsByFallback.set(fallbackKey, bridgeId);

    let operation = bridgeOperations.get(operationKey);
    if (!operation || signal === 'start') {
      bridgeOperationCounter += 1;
      operation = {
        operationId: `bridge-op-${bridgeOperationCounter}`,
        bridgeId,
      };
      bridgeOperations.set(operationKey, operation);
    }

    const error = signal === 'result' ? hookArgs.error : undefined;
    const result = signal === 'result' ? hookArgs.result : undefined;
    const isSkippedNavigation =
      context.operation === 'route-sync' &&
      isRecord(result) &&
      typeof result.type === 'number' &&
      isRecord(result.to) &&
      isRecord(result.from);
    const outcome =
      signal !== 'result'
        ? undefined
        : error !== undefined
          ? 'error'
          : (context.operation === 'destroy' && result === false) ||
              isSkippedNavigation
            ? 'skipped'
            : 'success';

    return {
      operationId: operation.operationId,
      bridgeId: operation.bridgeId,
      side: context.side,
      framework: context.framework,
      operation: context.operation,
      moduleName: context.moduleName,
      route: context.route,
      reason: context.reason,
      outcome,
      error,
    };
  };

  const recordBridgeSignal = (
    args: ObservabilityBridgeHookArgs,
    signal: 'start' | 'invoked' | 'result' | 'commit',
  ) => {
    const origin = args.origin || lastRuntimeOrigin;
    if (!origin || !prepareRuntimeOrigin(origin)) {
      return;
    }
    const bridgeArgs = resolveBridgeHookArgs(args, signal, origin);
    if (!bridgeArgs) {
      return;
    }
    const timingKey = [
      getInstanceRef(origin) || '',
      bridgeArgs.operationId,
      bridgeArgs.side,
      bridgeArgs.operation,
    ].join('\u0000');
    const legacyStartedAt = bridgeArgs.startedAt;
    const legacyEndedAt = bridgeArgs.endedAt;
    const startedAt =
      signal === 'start'
        ? typeof legacyStartedAt === 'number' &&
          Number.isFinite(legacyStartedAt)
          ? legacyStartedAt
          : Date.now()
        : bridgeStartTimes.get(timingKey) ||
          (typeof legacyStartedAt === 'number' &&
          Number.isFinite(legacyStartedAt)
            ? legacyStartedAt
            : Date.now());
    if (signal === 'start') {
      bridgeStartTimes.set(timingKey, startedAt);
    }
    const endedAt =
      signal === 'result' || signal === 'commit'
        ? typeof legacyEndedAt === 'number' && Number.isFinite(legacyEndedAt)
          ? legacyEndedAt
          : Date.now()
        : undefined;
    const bridge = normalizeBridgeInfo(bridgeArgs, {
      startedAt,
      endedAt,
      duration:
        endedAt === undefined ? undefined : Math.max(0, endedAt - startedAt),
    });
    if (!bridge) {
      return;
    }
    if (
      (signal === 'result' && bridge.operation !== 'render') ||
      signal === 'commit'
    ) {
      bridgeStartTimes.delete(timingKey);
    }
    updateBridgeState(origin, bridge, signal);
    const remote = bridge.remote ? { name: bridge.remote } : undefined;
    const status: ObservabilityEventStatus =
      signal === 'start'
        ? 'start'
        : bridge.outcome === 'error'
          ? 'error'
          : bridge.outcome === 'skipped'
            ? 'complete'
            : 'success';
    const phase =
      signal === 'commit'
        ? 'bridge-commit'
        : bridge.operation === 'destroy'
          ? 'bridge-destroy'
          : bridge.operation === 'route-sync'
            ? 'bridge-route'
            : 'bridge-render';
    const operationLabel =
      bridge.operation === 'update' ? 'update' : bridge.operation;
    const message =
      signal === 'start'
        ? `bridge:${operationLabel}-start`
        : signal === 'invoked'
          ? `bridge:${operationLabel}-invoked`
          : signal === 'commit'
            ? 'bridge:render-committed'
            : `bridge:${operationLabel}-${bridge.outcome || 'success'}`;
    const instanceRef = getInstanceRef(origin);

    if (
      signal === 'start' &&
      bridge.side === 'consumer' &&
      bridge.operation === 'render' &&
      instanceRef
    ) {
      const providerKey = `${instanceRef}\u0000${bridge.bridgeId}`;
      if (!reportedBridgeProviderKeys.has(providerKey)) {
        reportedBridgeProviderKeys.add(providerKey);
        recordEvent(
          {
            phase: 'bridge-provider',
            status: 'success',
            remote,
            expose: bridge.expose,
            bridge,
            lifecycle: 'beforeBridgeOperation',
            message: 'bridge:provider-acquired',
            source: 'runtime',
          },
          origin,
        );
      }
    }

    recordEvent(
      {
        phase,
        status,
        remote,
        expose: bridge.expose,
        bridge,
        duration: bridge.duration,
        lifecycle:
          signal === 'start'
            ? 'beforeBridgeOperation'
            : signal === 'invoked'
              ? 'bridgeRenderInvoked'
              : signal === 'commit'
                ? 'afterBridgeCommit'
                : 'afterBridgeOperation',
        message,
        error: bridge.outcome === 'error' ? bridge.error?.message : undefined,
        errorContext:
          bridge.outcome === 'error'
            ? {
                operationId: bridge.operationId,
                bridgeId: bridge.bridgeId,
                side: bridge.side,
                framework: bridge.framework,
                errorName: bridge.error?.name,
              }
            : undefined,
        source: 'runtime',
      },
      origin,
    );
  };

  const ensureSharedLoadContext = (
    args: ObservabilitySharedLifecycleArgs | ObservabilitySharedResolveArgs,
  ) => {
    const context = args.loadContext || {};
    if (!context.operationId) {
      sharedOperationCounter += 1;
      context.operationId = `shared-op-${sharedOperationCounter}`;
    }
    args.loadContext = context;
    return context;
  };

  const getCompletedSharedSelection = (
    args: ObservabilitySharedLifecycleArgs,
  ) => {
    const context = ensureSharedLoadContext(args);
    let selection = sharedSelections.get(context.operationId!);
    const scope =
      selection?.scope || getSharedScopes(args.shareInfo)[0] || 'default';
    const requiredVersion = args.shareInfo?.shareConfig?.requiredVersion;

    if (
      args.selectedShared &&
      (!selection?.selected || args.selectedShared === args.shareInfo)
    ) {
      const selectedVersion = args.selectedShared.version || '0';
      const selected = createRuntimeSharedCandidate(
        scope,
        selectedVersion,
        args.selectedShared,
        requiredVersion,
      );
      selection = {
        ...selection,
        scope,
        requestedVersion: args.shareInfo?.version,
        requiredVersion,
        singleton: args.shareInfo?.shareConfig?.singleton,
        strictVersion: args.shareInfo?.shareConfig?.strictVersion,
        eager: args.shareInfo?.shareConfig?.eager,
        strategy: args.shareInfo?.strategy,
        candidates: getRuntimeSharedCandidates({
          shareScopeMap: args.shareScopeMap,
          scope,
          pkgName: args.pkgName,
          requiredVersion,
        }),
        selected,
        reason: 'local-fallback',
        failureReason: undefined,
        fallback: true,
      };
    }

    if (!selection) {
      const candidates = getRuntimeSharedCandidates({
        shareScopeMap: args.shareScopeMap,
        scope,
        pkgName: args.pkgName,
        requiredVersion,
      });
      const failureReason = getSharedErrorReason(args);
      selection = {
        scope,
        requestedVersion: args.shareInfo?.version,
        requiredVersion,
        singleton: args.shareInfo?.shareConfig?.singleton,
        strictVersion: args.shareInfo?.shareConfig?.strictVersion,
        eager: args.shareInfo?.shareConfig?.eager,
        strategy: args.shareInfo?.strategy,
        candidates,
        reason:
          failureReason ||
          (args.selectedShared ? 'exact-match' : 'missing-provider'),
        failureReason,
      };
    }

    selection = {
      ...selection,
      loadType: args.lifecycle === 'loadShareSync' ? 'sync' : 'async',
      context,
      recovered: args.recovered || selection.recovered,
    };
    sharedSelections.delete(context.operationId!);
    return selection;
  };

  const legacyHooks: RuntimePluginHooks = {
    beforeBridgeOperation(args) {
      recordBridgeSignal(args as ObservabilityBridgeHookArgs, 'start');
    },
    bridgeRenderInvoked(args) {
      recordBridgeSignal(args as ObservabilityBridgeHookArgs, 'invoked');
    },
    afterBridgeOperation(args) {
      recordBridgeSignal(args as ObservabilityBridgeHookArgs, 'result');
    },
    afterBridgeCommit(args) {
      recordBridgeSignal(args as ObservabilityBridgeHookArgs, 'commit');
    },
    afterLoadManifest(args) {
      const manifestArgs = args as ObservabilityManifestLoadResultArgs;
      const outcome = manifestArgs.cached
        ? 'cached'
        : manifestArgs.error
          ? manifestArgs.recovered
            ? 'recovered'
            : 'error'
          : 'success';
      loadingManifestUrls.delete(manifestArgs.manifestUrl);
      if (outcome !== 'error') {
        seenManifestUrls.add(manifestArgs.manifestUrl);
      }
      return legacyHooks.afterLoadResource?.({
        origin: manifestArgs.origin,
        id:
          manifestArgs.resourceOptions?.id ||
          manifestArgs.moduleInfo.name ||
          manifestArgs.manifestUrl,
        initiator:
          manifestArgs.resourceOptions?.initiator || ('loadRemote' as const),
        resourceType: 'manifest',
        url: manifestArgs.manifestUrl,
        remote: manifestArgs.moduleInfo,
        outcome,
        response: manifestArgs.response,
        cacheSource: manifestArgs.cached ? 'mf-memory' : undefined,
        error: manifestArgs.error,
      });
    },
    beforeLoadResource(args) {
      const resourceArgs = args as ObservabilityResourceLoadArgs;
      if (!prepareRuntimeOrigin(resourceArgs.origin)) {
        return;
      }

      const timingKey = [
        getInstanceRef(resourceArgs.origin) || '',
        resourceArgs.id,
        resourceArgs.initiator,
        resourceArgs.resourceType,
        resourceArgs.url,
      ].join('\u0000');
      const legacyStartedAt = isRecord(resourceArgs)
        ? resourceArgs['startedAt']
        : undefined;
      const startedAt =
        typeof legacyStartedAt === 'number' && Number.isFinite(legacyStartedAt)
          ? legacyStartedAt
          : Date.now();
      const pendingStarts = resourceStartTimes.get(timingKey) || [];
      pendingStarts.push(startedAt);
      resourceStartTimes.set(timingKey, pendingStarts);
      const remote = createRemoteInfo(resourceArgs.remote);
      const phase =
        resourceArgs.resourceType === 'manifest' ||
        resourceArgs.resourceType === 'remoteEntry'
          ? resourceArgs.resourceType
          : 'preload';
      recordEvent(
        {
          phase,
          status: 'start',
          requestId: resourceArgs.id,
          remote,
          expose: resourceArgs.expose,
          url: resourceArgs.url,
          timestamp: startedAt,
          lifecycle: 'beforeLoadResource',
          message: `resource:${resourceArgs.resourceType}:load-start`,
          resource: {
            type: resourceArgs.resourceType,
            initiator: resourceArgs.initiator,
            url: resourceArgs.url,
            startedAt,
          },
        },
        resourceArgs.origin,
      );
    },
    afterLoadResource(args) {
      const resourceArgs = args as ObservabilityResourceLoadResultArgs;
      if (!prepareRuntimeOrigin(resourceArgs.origin)) {
        return;
      }

      const timingKey = [
        getInstanceRef(resourceArgs.origin) || '',
        resourceArgs.id,
        resourceArgs.initiator,
        resourceArgs.resourceType,
        resourceArgs.url,
      ].join('\u0000');
      const legacyStartedAt = isRecord(resourceArgs)
        ? resourceArgs['startedAt']
        : undefined;
      const legacyEndedAt = isRecord(resourceArgs)
        ? resourceArgs['endedAt']
        : undefined;
      const startedAt =
        resourceStartTimes.get(timingKey)?.shift() ||
        (typeof legacyStartedAt === 'number' && Number.isFinite(legacyStartedAt)
          ? legacyStartedAt
          : Date.now());
      const endedAt =
        typeof legacyEndedAt === 'number' && Number.isFinite(legacyEndedAt)
          ? legacyEndedAt
          : Date.now();
      if (resourceStartTimes.get(timingKey)?.length === 0) {
        resourceStartTimes.delete(timingKey);
      }
      const remote = createRemoteInfo(resourceArgs.remote);
      const phase =
        resourceArgs.resourceType === 'manifest' ||
        resourceArgs.resourceType === 'remoteEntry'
          ? resourceArgs.resourceType
          : 'preload';
      const response = resourceArgs.response;
      const httpStatus =
        resourceArgs.httpStatus ??
        (typeof response?.status === 'number' ? response.status : undefined);
      let mimeType = resourceArgs.mimeType;
      if (!mimeType && typeof response?.headers?.get === 'function') {
        try {
          mimeType = response.headers.get('content-type') || undefined;
        } catch {
          // Ignore custom response header access failures.
        }
      }
      const redirected =
        resourceArgs.redirected ??
        (typeof response?.redirected === 'boolean'
          ? response.redirected
          : undefined);
      const rawOutcome =
        resourceArgs.outcome === 'success' &&
        typeof httpStatus === 'number' &&
        httpStatus >= 400
          ? 'error'
          : resourceArgs.outcome;
      const resourceError =
        resourceArgs.error ||
        (rawOutcome === 'error' && typeof httpStatus === 'number'
          ? new Error(`Resource request failed with HTTP status ${httpStatus}.`)
          : undefined);
      const normalizedResourceArgs = {
        ...resourceArgs,
        outcome: rawOutcome,
        httpStatus,
        mimeType,
        redirected,
        error: resourceError,
      };
      const errorType = classifyResourceLoadError(normalizedResourceArgs);
      const outcome =
        rawOutcome === 'error' && errorType === 'timeout'
          ? 'timeout'
          : rawOutcome;
      const isError = outcome === 'error' || outcome === 'timeout';
      const status: ObservabilityEventStatus =
        outcome === 'recovered' ? 'complete' : isError ? 'error' : 'success';
      const duration = Math.max(0, endedAt - startedAt);
      const resource: ObservabilityResourceInfo = {
        type: resourceArgs.resourceType,
        initiator: resourceArgs.initiator,
        outcome,
        url: resourceArgs.url,
        startedAt,
        endedAt,
        duration,
        httpStatus,
        mimeType,
        redirected,
        cacheSource: resourceArgs.cacheSource,
        errorType,
      };

      recordEvent(
        {
          phase,
          status,
          requestId: resourceArgs.id,
          remote,
          expose: resourceArgs.expose,
          url: resourceArgs.url,
          timestamp: endedAt,
          duration,
          lifecycle: 'afterLoadResource',
          message: `resource:${resourceArgs.resourceType}:${outcome}`,
          error: isError || outcome === 'recovered' ? resourceError : undefined,
          recovered: outcome === 'recovered',
          cached: outcome === 'cached',
          resource,
          errorContext:
            isError || outcome === 'recovered'
              ? {
                  resourceType: resourceArgs.resourceType,
                  initiator: resourceArgs.initiator,
                  outcome,
                  errorType,
                  httpStatus,
                }
              : undefined,
          metadata: clipObservabilityMetadata({
            resourceType: resourceArgs.resourceType,
            initiator: resourceArgs.initiator,
            outcome,
            httpStatus,
            mimeType,
            redirected,
            cacheSource: resourceArgs.cacheSource,
            errorType,
          }),
        },
        resourceArgs.origin,
      );
    },
    beforeRequest(args) {
      const requestArgs = args as ObservabilityRemoteBeforeRequestArgs;
      if (!prepareRuntimeOrigin(requestArgs.origin)) {
        return returnHookArgs(args);
      }

      const remote = resolveRemoteFromRequestId(
        requestArgs.id,
        requestArgs.options,
      );

      recordEvent(
        {
          phase: 'loadRemote',
          status: 'start',
          requestId: requestArgs.id,
          remote,
          lifecycle: 'beforeRequest',
          message: 'remote:load-start',
        },
        requestArgs.origin,
      );

      return returnHookArgs(args);
    },
    afterMatchRemote(args) {
      const matchArgs = args as ObservabilityRemoteMatchArgs;
      if (!prepareRuntimeOrigin(matchArgs.origin)) {
        return;
      }

      const remote = createRemoteInfo(matchArgs.remoteInfo || matchArgs.remote);
      const hostRemotes = getHostRemotesSummary(matchArgs.options);
      recordEvent(
        {
          phase: 'matchRemote',
          status: matchArgs.error ? 'error' : 'success',
          requestId: matchArgs.id,
          lifecycle: 'afterMatchRemote',
          expose: matchArgs.expose,
          remote,
          message: matchArgs.error ? 'remote:match-failed' : 'remote:matched',
          error: matchArgs.error,
          errorContext: hostRemotes
            ? {
                hostRemotes,
              }
            : undefined,
        },
        matchArgs.origin,
      );
    },
    beforeLoadRemoteSnapshot(args) {
      const snapshotArgs = args as ObservabilityRemoteSnapshotArgs;
      prepareRuntimeOrigin(snapshotArgs.origin);
    },
    loadSnapshot(args) {
      if (!isEnabled()) {
        return returnHookArgs(args);
      }

      const snapshotArgs = args as ObservabilitySnapshotLoadArgs;
      const supportsResources = supportsResourceLifecycle(snapshotArgs.origin);
      const moduleRemote = createRemoteInfo(snapshotArgs.moduleInfo);
      const snapshotRemoteEntry =
        snapshotArgs.remoteSnapshot?.remoteEntry ||
        snapshotArgs.remoteSnapshot?.entry;
      const manifestUrl = isManifestUrl(moduleRemote?.entry)
        ? moduleRemote?.entry
        : isManifestUrl(snapshotRemoteEntry)
          ? snapshotRemoteEntry
          : undefined;
      if (!manifestUrl) {
        return returnHookArgs(args);
      }

      const remote = createRemoteInfo({
        name:
          moduleRemote?.name ||
          sanitizeText(snapshotArgs.remoteSnapshot?.name, 120),
        alias: moduleRemote?.alias,
        entry: manifestUrl,
        entryGlobalName:
          moduleRemote?.entryGlobalName ||
          sanitizeText(snapshotArgs.remoteSnapshot?.entryGlobalName, 120),
        type:
          moduleRemote?.type ||
          sanitizeText(snapshotArgs.remoteSnapshot?.type, 80),
      });

      if (seenManifestUrls.has(manifestUrl)) {
        if (supportsResources) {
          return returnHookArgs(args);
        }
        recordEvent(
          {
            phase: 'manifest',
            status: 'success',
            requestId: manifestUrl,
            remote,
            url: manifestUrl,
            lifecycle: 'loadSnapshot',
            message: 'manifest:cached',
            cached: true,
          },
          lastRuntimeOrigin,
        );

        return returnHookArgs(args);
      }

      if (loadingManifestUrls.has(manifestUrl)) {
        return returnHookArgs(args);
      }

      loadingManifestUrls.add(manifestUrl);

      if (supportsResources) {
        legacyHooks.beforeLoadResource?.({
          origin: snapshotArgs.origin,
          id: snapshotArgs.id || moduleRemote?.name || manifestUrl,
          initiator: snapshotArgs.initiator || 'loadRemote',
          resourceType: 'manifest',
          url: manifestUrl,
          remote,
        });
        return returnHookArgs(args);
      }

      recordEvent(
        {
          phase: 'manifest',
          status: 'start',
          requestId: manifestUrl,
          remote,
          url: manifestUrl,
          lifecycle: 'loadSnapshot',
          message: 'manifest:load-start',
        },
        lastRuntimeOrigin,
      );

      return returnHookArgs(args);
    },
    loadRemoteSnapshot(args) {
      if (options.enabled === false) {
        return returnHookArgs(args);
      }

      const snapshotArgs = args as ObservabilityRemoteSnapshotLoadArgs;
      if (supportsResourceLifecycle(lastRuntimeOrigin)) {
        return returnHookArgs(args);
      }
      if (snapshotArgs.from !== 'manifest') {
        return returnHookArgs(args);
      }

      const manifestUrl =
        sanitizeUrl(snapshotArgs.manifestUrl) ||
        sanitizeUrl(snapshotArgs.moduleInfo?.entry);
      const remote = createRemoteInfo({
        ...snapshotArgs.moduleInfo,
        entry: manifestUrl || snapshotArgs.moduleInfo?.entry,
      });
      const cached = Boolean(manifestUrl && seenManifestUrls.has(manifestUrl));

      recordEvent(
        {
          phase: 'manifest',
          status: 'success',
          requestId: manifestUrl,
          remote,
          url: manifestUrl,
          lifecycle: 'loadRemoteSnapshot',
          message: 'manifest:resolved',
          cached,
        },
        lastRuntimeOrigin,
      );
      if (manifestUrl) {
        loadingManifestUrls.delete(manifestUrl);
        seenManifestUrls.add(manifestUrl);
      }

      return returnHookArgs(args);
    },
    afterResolve(args) {
      const resolveArgs = args as ObservabilityRemoteResolveArgs;
      if (!prepareRuntimeOrigin(resolveArgs.origin)) {
        return returnHookArgs(args);
      }

      const remote = createRemoteInfo(
        resolveArgs.remoteInfo || resolveArgs.remote,
      );
      if (!isManifestUrl(remote?.entry)) {
        return returnHookArgs(args);
      }

      return returnHookArgs(args);
    },
    async onLoad(args) {
      const loadArgs = args as ObservabilityRemoteLoadArgs;
      if (!prepareRuntimeOrigin(loadArgs.origin)) {
        return;
      }

      const wrappedComponent =
        typeof loadArgs.exposeModuleFactory === 'function'
          ? await wrapReactComponentFactory(
              loadArgs.exposeModuleFactory,
              loadArgs,
            )
          : await wrapReactComponent(loadArgs.exposeModule, loadArgs);
      const remote = createRemoteInfo(loadArgs.remote);
      recordEvent(
        {
          phase: 'loadRemote',
          status: 'success',
          requestId: loadArgs.id,
          lifecycle: 'onLoad',
          expose: loadArgs.expose,
          remote,
          message: 'remote:loaded',
          loadedBefore: shouldCollectLoadedBefore()
            ? collectLoadedBeforeInfo(remote, loadArgs.expose, loadArgs.origin)
            : undefined,
        },
        loadArgs.origin,
      );
      if (wrappedComponent) {
        return wrappedComponent;
      }
      return undefined;
    },
    errorLoadRemote(args) {
      const errorArgs = args as ObservabilityRemoteErrorArgs;
      if (
        !prepareRuntimeOrigin(errorArgs.origin) ||
        (errorArgs.lifecycle !== 'onLoad' &&
          errorArgs.lifecycle !== 'beforeRequest' &&
          errorArgs.lifecycle !== 'afterResolve')
      ) {
        return undefined;
      }

      const isManifestError = errorArgs.lifecycle === 'afterResolve';
      if (isManifestError && errorArgs.id) {
        loadingManifestUrls.delete(errorArgs.id);
      }
      const remote = createRemoteInfo(errorArgs.remote);
      recordEvent(
        {
          phase: isManifestError ? 'manifest' : 'loadRemote',
          status: 'error',
          requestId: errorArgs.id,
          lifecycle: errorArgs.lifecycle,
          expose: errorArgs.expose,
          remote,
          url: isManifestError ? errorArgs.id : undefined,
          message: isManifestError
            ? 'manifest:failed'
            : errorArgs.lifecycle
              ? `remote:${errorArgs.lifecycle}:failed`
              : 'remote:failed',
          error: errorArgs.error,
          loadedBefore: collectLoadedBeforeInfo(
            remote,
            errorArgs.expose,
            errorArgs.origin,
          ),
        },
        errorArgs.origin,
      );

      return undefined;
    },
    afterLoadRemote(args) {
      const loadArgs = args as ObservabilityRemoteAfterLoadArgs;
      if (!prepareRuntimeOrigin(loadArgs.origin)) {
        return;
      }

      const remote = createRemoteInfo(loadArgs.remote);
      recordEvent(
        {
          phase: 'loadRemote',
          status: 'complete',
          requestId: loadArgs.id,
          lifecycle: 'afterLoadRemote',
          expose: loadArgs.expose,
          remote,
          message: loadArgs.recovered
            ? 'remote:load-recovered'
            : loadArgs.error
              ? 'remote:load-failed'
              : 'remote:load-complete',
          error: loadArgs.error,
          recovered: loadArgs.recovered,
          loadedBefore: shouldCollectLoadedBefore(loadArgs.error)
            ? collectLoadedBeforeInfo(remote, loadArgs.expose, loadArgs.origin)
            : undefined,
        },
        loadArgs.origin,
      );
    },
    loadEntry(args) {
      const entryArgs = args as ObservabilityRemoteEntryLoadArgs;
      if (
        supportsResourceLifecycle(entryArgs.origin) ||
        shouldSkipRuntimeHook(entryArgs.origin) ||
        !prepareRuntimeOrigin(entryArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(entryArgs.remoteInfo);
      recordEvent(
        {
          phase: 'remoteEntry',
          status: 'start',
          requestId: remote?.name,
          remote,
          url: remote?.entry,
          lifecycle: 'loadEntry',
          message: 'remoteEntry:load-start',
        },
        entryArgs.origin,
      );
    },
    afterLoadEntry(args) {
      const entryArgs = args as ObservabilityRemoteEntryAfterLoadArgs;
      if (
        (supportsResourceLifecycle(entryArgs.origin) && !entryArgs.recovered) ||
        shouldSkipRuntimeHook(entryArgs.origin) ||
        !prepareRuntimeOrigin(entryArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(entryArgs.remoteInfo);
      const remoteEntryKey = getRemoteEntryKey(sanitizeRemote(remote));
      const cached =
        entryArgs.cached === true ||
        Boolean(remoteEntryKey && seenRemoteEntryKeys.has(remoteEntryKey));
      recordEvent(
        {
          phase: 'remoteEntry',
          status: entryArgs.error ? 'error' : 'success',
          requestId: remote?.name,
          remote,
          url: remote?.entry,
          lifecycle: 'afterLoadEntry',
          message: entryArgs.error
            ? 'remoteEntry:load-failed'
            : entryArgs.recovered
              ? 'remoteEntry:load-recovered'
              : 'remoteEntry:loaded',
          error: entryArgs.error,
          recovered: entryArgs.recovered,
          cached,
        },
        entryArgs.origin,
      );
      if (!entryArgs.error && remoteEntryKey) {
        seenRemoteEntryKeys.add(remoteEntryKey);
      }
    },
    beforeInitRemote(args) {
      const initArgs = args as ObservabilityRemoteInitArgs;
      if (
        shouldSkipRuntimeHook(initArgs.origin) ||
        !prepareRuntimeOrigin(initArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(initArgs.remoteInfo);
      recordEvent(
        {
          phase: 'remoteEntryInit',
          status: 'start',
          requestId: initArgs.id || remote?.name,
          remote,
          lifecycle: 'beforeInitRemote',
          message: 'remoteEntry:init-start',
        },
        initArgs.origin,
      );
    },
    afterInitRemote(args) {
      const initArgs = args as ObservabilityRemoteInitArgs;
      if (
        shouldSkipRuntimeHook(initArgs.origin) ||
        !prepareRuntimeOrigin(initArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(initArgs.remoteInfo);
      recordEvent(
        {
          phase: 'remoteEntryInit',
          status: initArgs.error ? 'error' : 'success',
          requestId: initArgs.id || remote?.name,
          remote,
          lifecycle: 'afterInitRemote',
          message: initArgs.error
            ? 'remoteEntry:init-failed'
            : initArgs.cached
              ? 'remoteEntry:init-reused'
              : 'remoteEntry:initialized',
          error: initArgs.error,
          cached: initArgs.cached,
        },
        initArgs.origin,
      );
    },
    beforeGetExpose(args) {
      const exposeArgs = args as ObservabilityRemoteExposeArgs;
      if (
        shouldSkipRuntimeHook(exposeArgs.origin) ||
        !prepareRuntimeOrigin(exposeArgs.origin)
      ) {
        return;
      }

      recordEvent(
        {
          phase: 'expose',
          status: 'start',
          requestId: exposeArgs.id,
          expose: exposeArgs.expose,
          remote: createRemoteInfo(exposeArgs.moduleInfo),
          lifecycle: 'beforeGetExpose',
          message: 'expose:get-start',
        },
        exposeArgs.origin,
      );
    },
    afterGetExpose(args) {
      const exposeArgs = args as ObservabilityRemoteExposeArgs;
      if (
        shouldSkipRuntimeHook(exposeArgs.origin) ||
        !prepareRuntimeOrigin(exposeArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(exposeArgs.moduleInfo);
      recordEvent(
        {
          phase: 'expose',
          status: exposeArgs.error ? 'error' : 'success',
          requestId: exposeArgs.id,
          expose: exposeArgs.expose,
          remote,
          lifecycle: 'afterGetExpose',
          message: exposeArgs.error ? 'expose:get-failed' : 'expose:resolved',
          error: exposeArgs.error,
          loadedBefore: shouldCollectLoadedBefore(exposeArgs.error)
            ? collectLoadedBeforeInfo(
                remote,
                exposeArgs.expose,
                exposeArgs.origin,
              )
            : undefined,
        },
        exposeArgs.origin,
      );
    },
    beforeExecuteFactory(args) {
      const factoryArgs = args as ObservabilityRemoteFactoryArgs;
      if (
        shouldSkipRuntimeHook(factoryArgs.origin) ||
        !prepareRuntimeOrigin(factoryArgs.origin)
      ) {
        return;
      }

      recordEvent(
        {
          phase: 'moduleFactory',
          status: 'start',
          requestId: factoryArgs.id,
          expose: factoryArgs.expose,
          remote: createRemoteInfo(factoryArgs.moduleInfo),
          lifecycle: 'beforeExecuteFactory',
          message: 'moduleFactory:execute-start',
        },
        factoryArgs.origin,
      );
    },
    afterExecuteFactory(args) {
      const factoryArgs = args as ObservabilityRemoteFactoryArgs;
      if (
        shouldSkipRuntimeHook(factoryArgs.origin) ||
        !prepareRuntimeOrigin(factoryArgs.origin)
      ) {
        return;
      }

      const remote = createRemoteInfo(factoryArgs.moduleInfo);
      recordEvent(
        {
          phase: 'moduleFactory',
          status: factoryArgs.error ? 'error' : 'success',
          requestId: factoryArgs.id,
          expose: factoryArgs.expose,
          remote,
          lifecycle: 'afterExecuteFactory',
          message: factoryArgs.error
            ? 'moduleFactory:execute-failed'
            : 'moduleFactory:executed',
          error: factoryArgs.error,
          loadedBefore: shouldCollectLoadedBefore(factoryArgs.error)
            ? collectLoadedBeforeInfo(
                remote,
                factoryArgs.expose,
                factoryArgs.origin,
              )
            : undefined,
        },
        factoryArgs.origin,
      );
    },
    resolveShare(args) {
      const resolveArgs = args as ObservabilitySharedResolveArgs;
      if (
        (shouldGuardSharedHooksByRuntimeVersion &&
          !supportsRuntimeHookObservability(resolveArgs.origin)) ||
        !resolveArgs.origin ||
        !prepareRuntimeOrigin(resolveArgs.origin)
      ) {
        return args;
      }

      const context = ensureSharedLoadContext(resolveArgs);
      const resolver = resolveArgs.resolver;
      resolveArgs.resolver = () => {
        try {
          const result = resolver();
          sharedSelections.set(
            context.operationId!,
            createRuntimeSharedSelection(resolveArgs, result?.shared),
          );
          return result;
        } catch (error) {
          sharedSelections.set(
            context.operationId!,
            createRuntimeSharedSelection(resolveArgs, undefined, error),
          );
          throw error;
        }
      };

      return resolveArgs as typeof args;
    },
    beforeRegisterShare(args) {
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(args.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(args.origin)) {
        return returnHookArgs(args);
      }

      const shareScopeMap = getOriginShareScopeMap(args.origin);
      const hostName =
        sanitizeText(args.origin.options?.name, 120) ||
        sanitizeText(args.origin.name, 120);

      getSharedScopes(args.shared).forEach((scope) => {
        const conflict = createSharedSingletonConflict({
          pkgName: args.pkgName,
          shared: args.shared,
          scope,
          shareScopeMap,
        });

        if (!conflict) {
          return;
        }

        const conflictKey = getSharedConflictKey({
          hostName,
          pkgName: args.pkgName,
          conflict,
        });
        if (reportedSharedConflictKeys.has(conflictKey)) {
          return;
        }
        reportedSharedConflictKeys.add(conflictKey);

        recordEvent(
          {
            phase: 'shared-conflict',
            status: 'complete',
            requestId: `shared:${args.pkgName}`,
            lifecycle: 'beforeRegisterShare',
            shared: createSharedConflictInfo({
              pkgName: args.pkgName,
              shared: args.shared,
              conflict,
            }),
            message: `shared:${SHARED_SINGLETON_MULTIPLE_VERSIONS_REASON}`,
            metadata: {
              scope,
              currentVersion: conflict.currentVersion || '',
              versions: conflict.versions.join(','),
              existingVersions: conflict.existingVersions
                .map((item) => item.version)
                .join(','),
            },
          },
          args.origin,
        );
      });

      return returnHookArgs(args);
    },
    afterRegisterShare(args) {
      const registrationArgs = args as ObservabilitySharedRegistrationArgs;
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(registrationArgs.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(registrationArgs.origin)) {
        return returnHookArgs(args);
      }

      sharedRegistrationCounter += 1;
      const sharedInfo = createSharedRegistrationInfo(
        registrationArgs,
        `shared-register-${sharedRegistrationCounter}`,
      );
      const registration = sharedInfo.registration;
      recordEvent(
        {
          phase: 'shared-registration',
          status: 'success',
          requestId: registration?.registrationId,
          lifecycle: 'afterRegisterShare',
          shared: sharedInfo,
          message: `shared:registration-${registration?.action || 'unknown'}`,
          metadata: {
            scope: registration?.scope || registrationArgs.scope,
            action: registration?.action || 'unknown',
            reason: registration?.reason || 'unknown',
            trigger: registration?.trigger || registrationArgs.trigger,
          },
        },
        registrationArgs.origin,
      );

      return returnHookArgs(args);
    },
    beforeLoadShare(args) {
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(args.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(args.origin)) {
        return returnHookArgs(args);
      }

      ensureSharedLoadContext(args);
      recordEvent(
        {
          phase: 'shared',
          status: 'start',
          requestId: getSharedOperationId(args),
          lifecycle: 'loadShare',
          shared: createSharedInfo(args),
          message: 'shared:load-start',
        },
        args.origin,
      );

      return returnHookArgs(args);
    },
    afterLoadShare(args) {
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(args.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(args.origin)) {
        return returnHookArgs(args);
      }

      const selection = getCompletedSharedSelection(args);
      recordEvent(
        {
          phase: 'shared',
          status: 'success',
          requestId: getSharedOperationId(args),
          lifecycle: args.lifecycle,
          shared: createSharedInfo(args, undefined, selection),
          message:
            args.lifecycle === 'loadShareSync'
              ? 'shared:resolved-sync'
              : 'shared:resolved',
        },
        args.origin,
      );

      return returnHookArgs(args);
    },
    errorLoadShare(args) {
      if (
        shouldGuardSharedHooksByRuntimeVersion &&
        !supportsRuntimeHookObservability(args.origin)
      ) {
        return returnHookArgs(args);
      }

      if (!prepareRuntimeOrigin(args.origin)) {
        return returnHookArgs(args);
      }

      const handledCustomShareMiss = args.recovered === true && !args.error;
      const reason = handledCustomShareMiss
        ? 'custom-share-info-unmatched'
        : getSharedErrorReason(args);
      const selection = getCompletedSharedSelection(args);

      recordEvent(
        {
          phase: 'shared',
          status: handledCustomShareMiss ? 'complete' : 'error',
          requestId: getSharedOperationId(args),
          lifecycle: args.lifecycle,
          shared: createSharedInfo(args, reason, selection),
          message: reason ? `shared:${reason}` : undefined,
          error: handledCustomShareMiss ? undefined : args.error,
          recovered: args.recovered,
        },
        args.origin,
      );

      return returnHookArgs(args);
    },
  };

  if (!shouldDisablePreloadHooks) {
    legacyHooks.generatePreloadAssets = async (args) => {
      const preloadArgs = args as ObservabilityPreloadAssetsArgs;
      if (!prepareRuntimeOrigin(preloadArgs.origin)) {
        return continuePreloadAssetsGeneration();
      }

      const remote = createRemoteInfo(
        preloadArgs.remoteInfo || preloadArgs.remote,
      );
      const preloadConfig = preloadArgs.preloadOptions?.preloadConfig;
      recordEvent(
        {
          phase: 'preload',
          status: 'start',
          requestId:
            remote?.name || sanitizeText(preloadConfig?.nameOrAlias, 160),
          remote,
          lifecycle: 'generatePreloadAssets',
          message: 'preload:assets-ready',
          metadata: clipObservabilityMetadata({
            nameOrAlias: preloadConfig?.nameOrAlias,
            exposes: preloadConfig?.exposes?.join(','),
            resourceCategory: preloadConfig?.resourceCategory,
            share: preloadConfig?.share,
            depsRemote: Array.isArray(preloadConfig?.depsRemote)
              ? 'custom'
              : preloadConfig?.depsRemote,
          }),
        },
        preloadArgs.origin,
      );

      return continuePreloadAssetsGeneration();
    };

    legacyHooks.afterPreloadRemote = (args) => {
      const preloadArgs = args as ObservabilityAfterPreloadRemoteArgs;
      if (!prepareRuntimeOrigin(preloadArgs.origin)) {
        return undefined;
      }

      const results = preloadArgs.results || [];
      if (results.length === 0 && preloadArgs.error) {
        recordEvent(
          {
            phase: 'preload',
            status: 'error',
            requestId: 'preloadRemote',
            lifecycle: 'afterPreloadRemote',
            message: 'preload:failed',
            error: preloadArgs.error,
          },
          preloadArgs.origin,
        );
        return undefined;
      }

      results.forEach((preloadResult) => {
        const remote = createRemoteInfo(
          preloadResult.remoteInfo || preloadResult.remote,
        );
        const requestId =
          sanitizeRequestId(preloadResult.id) ||
          remote?.name ||
          sanitizeText(preloadResult.preloadConfig?.nameOrAlias, 160);

        if (supportsResourceLifecycle(preloadArgs.origin)) {
          const failedResource = preloadResult.results?.find(
            (assetResult) =>
              assetResult.status === 'error' ||
              assetResult.status === 'timeout',
          );
          recordEvent(
            {
              phase: 'preload',
              status: 'complete',
              requestId,
              remote,
              lifecycle: 'afterPreloadRemote',
              message: failedResource
                ? 'preload:completed-with-errors'
                : 'preload:complete',
              error: failedResource?.error,
              metadata: clipObservabilityMetadata({
                resourceCount: preloadResult.results?.length || 0,
                failedResourceCount:
                  preloadResult.results?.filter(
                    (assetResult) =>
                      assetResult.status === 'error' ||
                      assetResult.status === 'timeout',
                  ).length || 0,
                preloadNameOrAlias: preloadResult.preloadConfig?.nameOrAlias,
              }),
            },
            preloadArgs.origin,
          );
          return;
        }

        preloadResult.results?.forEach((assetResult) => {
          const isError =
            assetResult.status === 'error' || assetResult.status === 'timeout';
          recordEvent(
            {
              phase: 'preload',
              status: isError ? 'error' : 'success',
              requestId,
              remote,
              url: assetResult.url,
              cached: assetResult.status === 'cached',
              lifecycle: 'afterPreloadRemote',
              message: `preload:${assetResult.resourceType || 'resource'}:${assetResult.status || 'complete'}`,
              error: isError ? assetResult.error : undefined,
              errorContext: isError
                ? {
                    resourceType: assetResult.resourceType,
                    initiator: assetResult.initiator,
                    status: assetResult.status,
                    id: assetResult.id,
                  }
                : undefined,
              metadata: clipObservabilityMetadata({
                resourceType: assetResult.resourceType,
                initiator: assetResult.initiator,
                status: assetResult.status,
                id: assetResult.id,
                preloadNameOrAlias: preloadResult.preloadConfig?.nameOrAlias,
              }),
            },
            preloadArgs.origin,
          );
        });
      });

      return undefined;
    };
  }

  const createRuntimeHooks = (
    boundInstance?: ModuleFederation,
  ): RuntimePluginHooks => {
    if (!boundInstance) {
      return legacyHooks;
    }

    const boundHooks: Record<string, unknown> = {};
    Object.entries(legacyHooks as Record<string, unknown>).forEach(
      ([lifecycle, handler]) => {
        if (typeof handler !== 'function') {
          return;
        }
        boundHooks[lifecycle] = (...handlerArgs: unknown[]) => {
          const origin = boundInstance as ObservabilityRuntimeOrigin;
          prepareRuntimeOrigin(origin);
          const [firstArg, ...remainingArgs] = handlerArgs;
          const boundFirstArg = isRecord(firstArg)
            ? {
                ...firstArg,
                origin,
              }
            : firstArg;
          return (handler as (...args: unknown[]) => unknown)(
            boundFirstArg,
            ...remainingArgs,
          );
        };
      },
    );
    return boundHooks as RuntimePluginHooks;
  };

  const plugin: ObservabilityRuntimePlugin = {
    name: pluginName,
    apply(instance: ModuleFederation) {
      const origin = instance as ObservabilityRuntimeOrigin;
      registerRuntimeInstance(
        origin,
        getActiveRuntimeInstances().some((item) => item === instance),
      );
      const instanceRef = getInstanceRef(origin);
      if (instanceRef) {
        boundInstanceRefs.add(instanceRef);
      }
      appliedRuntimeVersion =
        sanitizeText(instance.version, 80) || appliedRuntimeVersion;
      if (shouldAttachInstanceApi) {
        let instanceApi = attachedInstanceApis.get(instance);
        if (!instanceApi) {
          instanceApi = {
            markComponentLoaded: (markOptions) =>
              markComponentLoadedFor(markOptions, origin),
          };
          attachedInstanceApis.set(instance, instanceApi);
        }
        (instance as ObservableModuleFederation).markComponentLoaded =
          instanceApi.markComponentLoaded;
      }
      prepareOutputChannels(origin);
      openRuntimeAdapter?.register();
      return createRuntimeHooks(instance);
    },
    ...legacyHooks,
  };

  return {
    plugin,
    getEvents() {
      return getEventsSnapshot();
    },
    getTraceIds() {
      return getTraceIdsSnapshot();
    },
    getReports(options?: ObservabilityReportListOptions) {
      return getReportsSnapshot(options);
    },
    findReports(query?: ObservabilityReportQuery) {
      return findReportsSnapshot(query);
    },
    getLatestReport() {
      return getLatestReportSnapshot();
    },
    getReport(traceId: string) {
      return getReportSnapshot(traceId);
    },
    exportReport(traceId?: string) {
      return exportReportSnapshot(traceId);
    },
    getRuntimeState() {
      return getRuntimeStateSnapshot();
    },
    clear() {
      events.length = 0;
      reports.clear();
      traceByRequest.clear();
      traceByRemote.clear();
      traceByBridgeOperation.clear();
      traceByBridgeId.clear();
      latestTraceByInstance.clear();
      phaseStartTimes.clear();
      bridgeStartTimes.clear();
      resourceStartTimes.clear();
      seenManifestUrls.clear();
      seenRemoteEntryKeys.clear();
      reportedBridgeProviderKeys.clear();
      consoleReportedTraceIds.clear();
      consoleReportedStartKeys.clear();
      latestTraceId = undefined;
      runtimeObservabilityEnabled = false;
      effectiveMaxEvents = configuredMaxEvents;
      browserGlobalScope = undefined;
      lastRuntimeOrigin = undefined;
      historyCleared = true;
    },
    markComponentLoaded,
  };
}
