import fs from 'node:fs';
import path from 'node:path';
import { simpleJoinRemoteEntry } from '@module-federation/sdk';

export type ObservabilityBuildInfoSource = 'config' | 'stats' | 'manifest';
export type ObservabilityBuildPublicPathMode =
  | 'auto'
  | 'static'
  | 'runtime-getter'
  | 'unknown';
export type ObservabilityBuildReportPhase =
  | 'compilation'
  | 'observability-output';
export type ObservabilityBuildOwnerHint =
  | 'host'
  | 'remote'
  | 'shared'
  | 'build'
  | 'unknown';
export type ObservabilityBuildMetadata = Record<
  string,
  string | number | boolean
>;

export interface ObservabilityBuildRemote {
  name?: string;
  alias?: string;
  entry?: string;
  type?: string;
  shareScope?: string | string[];
}

export interface ObservabilityBuildExpose {
  name: string;
}

export interface ObservabilityBuildShared {
  name: string;
  shareScope?: string | string[];
  version?: string;
  requiredVersion?: string | false;
  singleton?: boolean;
  strictVersion?: boolean;
  eager?: boolean;
}

export interface ObservabilityBuildInfo {
  schemaVersion: 1;
  generatedAt: string;
  source: ObservabilityBuildInfoSource;
  bundler: {
    name: string;
    version?: string;
    mode?: string;
    target?: string[];
  };
  moduleFederation: {
    name?: string;
    pluginVersion?: string;
    buildVersion?: string;
    buildName?: string;
    remoteEntry?: {
      name?: string;
      type?: string;
      globalName?: string;
      publicPath?: string;
      publicPathMode: ObservabilityBuildPublicPathMode;
    };
    options: {
      shareStrategy?: string;
      shareScope?: string | string[];
      asyncStartup?: boolean;
      manifest?: boolean | string;
      dts?: boolean;
    };
    remotes: ObservabilityBuildRemote[];
    exposes: ObservabilityBuildExpose[];
    shared: ObservabilityBuildShared[];
  };
  summary: {
    remoteCount: number;
    exposeCount: number;
    sharedCount: number;
  };
}

export interface ObservabilityBuildErrorSummary {
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  failedPhase: ObservabilityBuildReportPhase;
  ownerHint: ObservabilityBuildOwnerHint;
  retryable: false;
  context?: Record<string, string | number | boolean>;
}

export interface ObservabilityBuildAction {
  id: string;
  ownerHint?: ObservabilityBuildOwnerHint;
  title: string;
  detail?: string;
}

export interface ObservabilityBuildFactReport {
  title: string;
  outcome: 'failed';
  status: 'error';
  ownerHint: ObservabilityBuildOwnerHint;
  failedPhase: ObservabilityBuildReportPhase;
  errorCode?: string;
  errorName?: string;
  errorMessage?: string;
  facts: ObservabilityBuildMetadata;
  completedPhases: string[];
  pendingPhases: string[];
  actions: ObservabilityBuildAction[];
}

export interface ObservabilityBuildEvent extends ObservabilityBuildErrorSummary {
  traceId: string;
  timestamp: number;
  phase: 'build';
  status: 'error';
  lifecycle: ObservabilityBuildReportPhase;
  errorStack?: string;
}

export interface ObservabilityBuildReport {
  schemaVersion: 1;
  traceId: string;
  source: 'build';
  status: 'error';
  startedAt: number;
  updatedAt: number;
  duration: number;
  failedPhase: ObservabilityBuildReportPhase;
  build: ObservabilityBuildInfo;
  events: ObservabilityBuildEvent[];
  summary: {
    eventCount: number;
    outcome: 'failed';
    error?: ObservabilityBuildErrorSummary;
    errors: ObservabilityBuildErrorSummary[];
  };
  diagnosis: ObservabilityBuildFactReport;
}

export interface CreateObservabilityBuildInfoOptions {
  moduleFederation?: unknown;
  manifest?: unknown;
  stats?: unknown;
  compilerOptions?: Record<string, unknown>;
  bundler?: string;
  bundlerVersion?: string;
  pluginVersion?: string;
  generatedAt?: string;
}

export interface ObservabilityBuildPluginOptions {
  enabled?: boolean;
  outputFile?: string;
  errorReport?:
    | false
    | {
        outputFile?: string;
      };
  cwd?: string;
  bundler?: string;
  bundlerVersion?: string;
  pluginVersion?: string;
  moduleFederation?: unknown;
}

interface CompilerLike {
  context?: string;
  options?: Record<string, unknown>;
  webpack?: {
    version?: string;
    rspackVersion?: string;
    sources?: {
      RawSource?: new (value: string) => unknown;
    };
    Compilation?: {
      PROCESS_ASSETS_STAGE_REPORT?: number;
      PROCESS_ASSETS_STAGE_SUMMARIZE?: number;
    };
  };
  hooks?: {
    thisCompilation?: {
      tap(name: string, callback: (compilation: CompilationLike) => void): void;
    };
  };
  getInfrastructureLogger?: (name: string) => {
    warn?: (message: string) => void;
  };
}

interface CompilationLike {
  constructor?: {
    PROCESS_ASSETS_STAGE_REPORT?: number;
    PROCESS_ASSETS_STAGE_SUMMARIZE?: number;
  };
  hooks?: {
    processAssets?: {
      tapPromise(
        options: { name: string; stage?: number },
        callback: () => Promise<void>,
      ): void;
    };
  };
  getAsset?: (name: string) =>
    | {
        source?: unknown;
      }
    | undefined;
  emitAsset?: (name: string, source: unknown) => void;
  assets?: Record<string, unknown>;
  errors?: unknown[];
}

const PLUGIN_NAME = 'ObservabilityBuildPlugin';
const DEFAULT_OUTPUT_FILE = '.mf/observability/build-info.json';
const DEFAULT_REPORT_FILE = '.mf/observability/build-report.json';
const DEFAULT_MANIFEST_FILE = 'mf-manifest.json';
const DEFAULT_STATS_FILE = 'mf-stats.json';
const ERROR_CODE_PATTERN = /\b(?:RUNTIME|TYPE|BUILD)-\d{3}\b/;
const MAX_BUILD_FACT_KEYS = 50;
const SENSITIVE_PAIR_PATTERN =
  /\b(token|authorization|cookie|secret|password|session|access_token|refresh_token|api_key|apikey|key)\s*[:=]\s*([^&\s'",;<>]+)/gi;
const URL_PATTERN = /https?:\/\/[^\s'"<>]+/g;
const ABSOLUTE_PATH_PATTERN =
  /(?:file:\/\/)?(?:\/(?:Users|private|var|tmp|home|workspace|opt|usr)\/[^\s)]+|[A-Za-z]:\\[^\s)]+)/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function sanitizeText(value: unknown, maxLength = 240): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const sanitized = String(value)
    .replace(URL_PATTERN, (url) => sanitizeUrl(url) || '[redacted-url]')
    .replace(ABSOLUTE_PATH_PATTERN, '[redacted-path]')
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

function sanitizeStack(value: unknown): string | undefined {
  const stack = getString(value);
  if (!stack) {
    return undefined;
  }

  return stack;
}

function extractErrorCode(value: unknown): string | undefined {
  return sanitizeText(String(value ?? '').match(ERROR_CODE_PATTERN)?.[0], 40);
}

function sanitizeUrl(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(value, 'http://localhost');
    const sanitized = `${parsedUrl.origin}${parsedUrl.pathname}`;

    return /^https?:\/\//i.test(value) ? sanitized : parsedUrl.pathname;
  } catch {
    const [withoutHash] = value.split('#');
    const [withoutQuery] = withoutHash.split('?');
    return sanitizeText(withoutQuery, 320);
  }
}

function sanitizeRemoteEntry(value: unknown): string | undefined {
  const raw = getString(value);
  if (!raw) {
    return undefined;
  }

  const atIndex = raw.lastIndexOf('@');
  if (atIndex > 0) {
    const remoteName = sanitizeText(raw.slice(0, atIndex), 120);
    const entry = clipText(raw.slice(atIndex + 1), 320);
    if (remoteName && entry) {
      return `${remoteName}@${entry}`;
    }
    return entry || remoteName;
  }

  return clipText(raw, 320);
}

function sanitizePublicPath(value: unknown): string | undefined {
  const raw = getString(value);
  if (!raw) {
    return undefined;
  }

  return clipText(raw, 320);
}

function getSanitizedString(value: unknown, maxLength = 160) {
  return sanitizeText(value, maxLength);
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    const sanitized = getSanitizedString(value);
    return sanitized ? [sanitized] : undefined;
  }

  const values = value
    .map((item) => getSanitizedString(item))
    .filter((item): item is string => Boolean(item));

  return values.length ? values.slice(0, 20) : undefined;
}

function normalizeShareScope(value: unknown): string | string[] | undefined {
  if (Array.isArray(value)) {
    const scopes = normalizeStringArray(value);
    return scopes?.length ? scopes : undefined;
  }

  return getSanitizedString(value);
}

function normalizeRequiredVersion(value: unknown): string | false | undefined {
  if (value === false) {
    return false;
  }

  return getSanitizedString(value, 120);
}

function normalizeManifestOption(value: unknown): boolean | string | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  const manifestOptions = getRecord(value);
  if (!manifestOptions) {
    return undefined;
  }

  return getSanitizedString(manifestOptions['fileName'], 120) || true;
}

function getManifestFileName(manifestOption: unknown) {
  const manifestOptions = getRecord(manifestOption);
  const filePath = getString(manifestOptions?.['filePath']) || '';
  const fileName = getString(manifestOptions?.['fileName']);
  const manifestFile = fileName
    ? addJsonExtension(fileName)
    : DEFAULT_MANIFEST_FILE;
  const statsFile = fileName
    ? insertSuffix(addJsonExtension(fileName), '-stats')
    : DEFAULT_STATS_FILE;

  return {
    manifestFileName: simpleJoinRemoteEntry(filePath, manifestFile),
    statsFileName: simpleJoinRemoteEntry(filePath, statsFile),
  };
}

function addJsonExtension(fileName: string) {
  return /\.json$/i.test(fileName) ? fileName : `${fileName}.json`;
}

function insertSuffix(fileName: string, suffix: string) {
  return fileName.replace(/\.json$/i, `${suffix}.json`);
}

function getSourceText(source: unknown): string | undefined {
  if (source === undefined || source === null) {
    return undefined;
  }

  if (typeof source === 'string') {
    return source;
  }

  if (typeof source === 'function') {
    try {
      return getSourceText(source());
    } catch {
      return undefined;
    }
  }

  const sourceRecord = getRecord(source);
  const sourceFn = sourceRecord?.['source'];
  if (typeof sourceFn === 'function') {
    try {
      return getSourceText(sourceFn.call(source));
    } catch {
      return undefined;
    }
  }

  return String(source);
}

function readAssetText(
  compilation: CompilationLike,
  fileName: string,
): string | undefined {
  const asset = compilation.getAsset?.(fileName);
  const assetSource = asset ? getSourceText(asset.source) : undefined;
  if (assetSource !== undefined) {
    return assetSource;
  }

  const legacyAsset = compilation.assets?.[fileName];
  return getSourceText(legacyAsset);
}

function readJsonAsset(
  compilation: CompilationLike,
  fileName: string,
): Record<string, unknown> | undefined {
  const text = readAssetText(compilation, fileName);
  if (!text) {
    return undefined;
  }

  try {
    return getRecord(JSON.parse(text));
  } catch {
    return undefined;
  }
}

function getRemoteParts(value: unknown) {
  const raw = getString(value);
  if (!raw) {
    return {};
  }

  const atIndex = raw.lastIndexOf('@');
  if (atIndex > 0) {
    return {
      name: getSanitizedString(raw.slice(0, atIndex), 120),
      entry: sanitizeRemoteEntry(raw.slice(atIndex + 1)),
    };
  }

  return {
    entry: sanitizeRemoteEntry(raw),
  };
}

function normalizeRemoteFromConfig(
  alias: string | undefined,
  value: unknown,
): ObservabilityBuildRemote | undefined {
  const remote: ObservabilityBuildRemote = {
    alias: getSanitizedString(alias, 120),
  };

  if (typeof value === 'string') {
    const parts = getRemoteParts(value);
    remote.name = parts.name || remote.alias;
    remote.entry = parts.entry;
    return remote.name || remote.entry ? remote : undefined;
  }

  if (Array.isArray(value)) {
    const firstValue = value.find(
      (item) => typeof item === 'string' || isRecord(item),
    );
    return normalizeRemoteFromConfig(alias, firstValue);
  }

  const remoteOptions = getRecord(value);
  if (!remoteOptions) {
    return remote.alias ? remote : undefined;
  }

  const entryValue =
    remoteOptions['entry'] ||
    remoteOptions['external'] ||
    remoteOptions['version'];
  const parts = getRemoteParts(entryValue);

  remote.name =
    getSanitizedString(remoteOptions['name'], 120) ||
    getSanitizedString(remoteOptions['federationContainerName'], 120) ||
    parts.name ||
    remote.alias;
  remote.alias =
    getSanitizedString(remoteOptions['alias'], 120) || remote.alias;
  remote.entry = parts.entry || sanitizeRemoteEntry(entryValue);
  remote.type = getSanitizedString(remoteOptions['type'], 80);
  remote.shareScope = normalizeShareScope(remoteOptions['shareScope']);

  return remote.name || remote.entry ? remote : undefined;
}

function normalizeRemoteFromManifest(
  value: unknown,
): ObservabilityBuildRemote | undefined {
  const remoteOptions = getRecord(value);
  if (!remoteOptions) {
    return undefined;
  }

  const entryValue = remoteOptions['entry'] || remoteOptions['version'];
  const remote: ObservabilityBuildRemote = {
    name:
      getSanitizedString(remoteOptions['moduleName'], 120) ||
      getSanitizedString(remoteOptions['name'], 120) ||
      getSanitizedString(remoteOptions['federationContainerName'], 120),
    alias: getSanitizedString(remoteOptions['alias'], 120),
    entry: sanitizeRemoteEntry(entryValue),
    type: getSanitizedString(remoteOptions['type'], 80),
    shareScope: normalizeShareScope(remoteOptions['shareScope']),
  };

  return remote.name || remote.entry ? remote : undefined;
}

function normalizeConfigRemotes(value: unknown): ObservabilityBuildRemote[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeRemoteFromConfig(undefined, item))
      .filter((item): item is ObservabilityBuildRemote => Boolean(item));
  }

  const remotes = getRecord(value);
  if (!remotes) {
    return [];
  }

  return Object.entries(remotes)
    .map(([alias, remote]) => normalizeRemoteFromConfig(alias, remote))
    .filter((remote): remote is ObservabilityBuildRemote => Boolean(remote));
}

function normalizeManifestRemotes(value: unknown): ObservabilityBuildRemote[] {
  return (Array.isArray(value) ? value : [])
    .map(normalizeRemoteFromManifest)
    .filter((remote): remote is ObservabilityBuildRemote => Boolean(remote));
}

function normalizeConfigExposes(value: unknown): ObservabilityBuildExpose[] {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === 'string'
          ? getSanitizedString(item, 160)
          : getSanitizedString(getRecord(item)?.['name'], 160),
      )
      .filter((name): name is string => Boolean(name))
      .map((name) => ({ name }));
  }

  const exposes = getRecord(value);
  if (!exposes) {
    return [];
  }

  return Object.keys(exposes)
    .map((name) => getSanitizedString(name, 160))
    .filter((name): name is string => Boolean(name))
    .map((name) => ({ name }));
}

function normalizeManifestExposes(value: unknown): ObservabilityBuildExpose[] {
  return (Array.isArray(value) ? value : [])
    .map((item) => {
      const expose = getRecord(item);
      return (
        getSanitizedString(expose?.['name'], 160) ||
        getSanitizedString(expose?.['id'], 160)
      );
    })
    .filter((name): name is string => Boolean(name))
    .map((name) => ({ name }));
}

function normalizeSharedFromRecord(
  name: string | undefined,
  value: unknown,
): ObservabilityBuildShared | undefined {
  const sharedOptions = getRecord(value);
  if (!sharedOptions) {
    const sharedName =
      name ||
      (typeof value === 'string' ? getSanitizedString(value, 160) : undefined);
    return sharedName ? { name: sharedName } : undefined;
  }

  const sharedName =
    getSanitizedString(sharedOptions['name'], 160) ||
    getSanitizedString(sharedOptions['shareKey'], 160) ||
    name;

  if (!sharedName) {
    return undefined;
  }

  return {
    name: sharedName,
    shareScope: normalizeShareScope(sharedOptions['shareScope']),
    version: getSanitizedString(sharedOptions['version'], 120),
    requiredVersion: normalizeRequiredVersion(sharedOptions['requiredVersion']),
    singleton: getBoolean(sharedOptions['singleton']),
    strictVersion: getBoolean(sharedOptions['strictVersion']),
    eager: getBoolean(sharedOptions['eager']),
  };
}

function normalizeConfigShared(value: unknown): ObservabilityBuildShared[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeSharedFromRecord(undefined, item))
      .filter((shared): shared is ObservabilityBuildShared => Boolean(shared));
  }

  const shared = getRecord(value);
  if (!shared) {
    return [];
  }

  return Object.entries(shared)
    .map(([name, sharedOptions]) =>
      normalizeSharedFromRecord(getSanitizedString(name, 160), sharedOptions),
    )
    .filter((item): item is ObservabilityBuildShared => Boolean(item));
}

function normalizeManifestShared(value: unknown): ObservabilityBuildShared[] {
  return (Array.isArray(value) ? value : [])
    .map((item) => {
      const sharedOptions = getRecord(item);
      return normalizeSharedFromRecord(
        getSanitizedString(sharedOptions?.['name'], 160) ||
          getSanitizedString(sharedOptions?.['id'], 160),
        sharedOptions,
      );
    })
    .filter((shared): shared is ObservabilityBuildShared => Boolean(shared));
}

function getPublicPathInfo(
  metaData: Record<string, unknown> | undefined,
  compilerOptions: Record<string, unknown> | undefined,
) {
  const outputOptions = getRecord(compilerOptions?.['output']);
  const getPublicPath = metaData?.['getPublicPath'];
  const publicPath = metaData?.['publicPath'] || outputOptions?.['publicPath'];

  if (getPublicPath) {
    return {
      mode: 'runtime-getter' as const,
      value: undefined,
    };
  }

  const sanitizedPublicPath = sanitizePublicPath(publicPath);
  if (publicPath === 'auto') {
    return {
      mode: 'auto' as const,
      value: 'auto',
    };
  }

  if (sanitizedPublicPath) {
    return {
      mode: 'static' as const,
      value: sanitizedPublicPath,
    };
  }

  return {
    mode: 'unknown' as const,
    value: undefined,
  };
}

function normalizeTarget(value: unknown): string[] | undefined {
  return normalizeStringArray(value);
}

function getManifestSource(
  manifest: Record<string, unknown> | undefined,
  stats: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  return manifest || stats;
}

function getMetaData(
  manifest: Record<string, unknown> | undefined,
  stats: Record<string, unknown> | undefined,
) {
  return (
    getRecord(manifest?.['metaData']) ||
    getRecord(stats?.['metaData']) ||
    undefined
  );
}

function getBuildInfo(metaData: Record<string, unknown> | undefined) {
  return getRecord(metaData?.['buildInfo']);
}

function getSource(
  manifest: Record<string, unknown> | undefined,
  stats: Record<string, unknown> | undefined,
): ObservabilityBuildInfoSource {
  if (manifest) {
    return 'manifest';
  }
  if (stats) {
    return 'stats';
  }
  return 'config';
}

function getConfigOptions(moduleFederation: unknown) {
  return getRecord(moduleFederation) || {};
}

function getRemoteEntryType(
  moduleFederation: Record<string, unknown>,
  metaData: Record<string, unknown> | undefined,
) {
  const remoteEntry = getRecord(metaData?.['remoteEntry']);
  const library = getRecord(moduleFederation['library']);

  return (
    getSanitizedString(remoteEntry?.['type'], 80) ||
    getSanitizedString(library?.['type'], 80)
  );
}

function getRemoteEntryName(
  moduleFederation: Record<string, unknown>,
  metaData: Record<string, unknown> | undefined,
) {
  const remoteEntry = getRecord(metaData?.['remoteEntry']);

  return (
    getSanitizedString(remoteEntry?.['name'], 160) ||
    getSanitizedString(moduleFederation['filename'], 160)
  );
}

function getGlobalName(
  moduleFederation: Record<string, unknown>,
  metaData: Record<string, unknown> | undefined,
) {
  const library = getRecord(moduleFederation['library']);

  return (
    getSanitizedString(metaData?.['globalName'], 160) ||
    getSanitizedString(library?.['name'], 160)
  );
}

function getBundlerName(
  inputBundler: string | undefined,
  compilerOptions: Record<string, unknown> | undefined,
) {
  return (
    getSanitizedString(inputBundler, 80) ||
    getSanitizedString(compilerOptions?.['name'], 80) ||
    'unknown'
  );
}

function getBundlerVersion(
  inputVersion: string | undefined,
  compilerOptions: Record<string, unknown> | undefined,
) {
  return (
    getSanitizedString(inputVersion, 80) ||
    getSanitizedString(compilerOptions?.['webpackVersion'], 80)
  );
}

function getDtsOption(value: unknown) {
  if (value === false) {
    return false;
  }
  if (value === undefined) {
    return undefined;
  }
  return true;
}

function getAsyncStartup(moduleFederation: Record<string, unknown>) {
  const experiments = getRecord(moduleFederation['experiments']);
  return getBoolean(experiments?.['asyncStartup']);
}

function uniqueByName<T extends { name?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name || JSON.stringify(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function createObservabilityBuildInfo(
  input: CreateObservabilityBuildInfoOptions,
): ObservabilityBuildInfo {
  const moduleFederation = getConfigOptions(input.moduleFederation);
  const manifest = getRecord(input.manifest);
  const stats = getRecord(input.stats);
  const manifestSource = getManifestSource(manifest, stats);
  const metaData = getMetaData(manifest, stats);
  const buildInfo = getBuildInfo(metaData);
  const publicPath = getPublicPathInfo(metaData, input.compilerOptions);
  const manifestRemotes = normalizeManifestRemotes(manifestSource?.['remotes']);
  const manifestExposes = normalizeManifestExposes(manifestSource?.['exposes']);
  const manifestShared = normalizeManifestShared(manifestSource?.['shared']);
  const remotes = uniqueByName(
    manifestRemotes.length
      ? manifestRemotes
      : normalizeConfigRemotes(moduleFederation['remotes']),
  );
  const exposes = uniqueByName(
    manifestExposes.length
      ? manifestExposes
      : normalizeConfigExposes(moduleFederation['exposes']),
  );
  const shared = uniqueByName(
    manifestShared.length
      ? manifestShared
      : normalizeConfigShared(moduleFederation['shared']),
  );

  return {
    schemaVersion: 1,
    generatedAt: input.generatedAt || new Date().toISOString(),
    source: getSource(manifest, stats),
    bundler: {
      name: getBundlerName(input.bundler, input.compilerOptions),
      version: getBundlerVersion(input.bundlerVersion, input.compilerOptions),
      mode: getSanitizedString(input.compilerOptions?.['mode'], 80),
      target: normalizeTarget(input.compilerOptions?.['target']),
    },
    moduleFederation: {
      name:
        getSanitizedString(manifestSource?.['name'], 160) ||
        getSanitizedString(metaData?.['name'], 160) ||
        getSanitizedString(moduleFederation['name'], 160),
      pluginVersion:
        getSanitizedString(metaData?.['pluginVersion'], 80) ||
        getSanitizedString(input.pluginVersion, 80),
      buildVersion: getSanitizedString(buildInfo?.['buildVersion'], 160),
      buildName: getSanitizedString(buildInfo?.['buildName'], 160),
      remoteEntry: {
        name: getRemoteEntryName(moduleFederation, metaData),
        type: getRemoteEntryType(moduleFederation, metaData),
        globalName: getGlobalName(moduleFederation, metaData),
        publicPath: publicPath.value,
        publicPathMode: publicPath.mode,
      },
      options: {
        shareStrategy: getSanitizedString(
          moduleFederation['shareStrategy'],
          80,
        ),
        shareScope: normalizeShareScope(moduleFederation['shareScope']),
        asyncStartup: getAsyncStartup(moduleFederation),
        manifest: normalizeManifestOption(moduleFederation['manifest']),
        dts: getDtsOption(moduleFederation['dts']),
      },
      remotes,
      exposes,
      shared,
    },
    summary: {
      remoteCount: remotes.length,
      exposeCount: exposes.length,
      sharedCount: shared.length,
    },
  };
}

function getErrorRecord(error: unknown): Record<string, unknown> | undefined {
  return getRecord(error);
}

function getErrorName(error: unknown): string | undefined {
  if (error instanceof Error) {
    return getSanitizedString(error.name, 120);
  }

  const errorRecord = getErrorRecord(error);
  const constructorName =
    typeof error === 'object' && error !== null
      ? getSanitizedString(
          (error as { constructor?: { name?: unknown } }).constructor?.name,
          120,
        )
      : undefined;
  return getSanitizedString(errorRecord?.['name'], 120) || constructorName;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) {
    return getRawText(error.message);
  }

  const errorRecord = getErrorRecord(error);
  return getRawText(errorRecord?.['message']) || getRawText(error);
}

function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return sanitizeStack(error.stack);
  }

  return sanitizeStack(getErrorRecord(error)?.['stack']);
}

function getBuildOwnerHint(
  error: unknown,
  phase: ObservabilityBuildReportPhase,
): ObservabilityBuildOwnerHint {
  if (phase === 'observability-output') {
    return 'build';
  }

  const text = `${getErrorName(error) || ''}\n${getErrorMessage(error) || ''}\n${
    getErrorStack(error) || ''
  }`;

  if (/shared|shareScope|singleton|strictVersion|eager/i.test(text)) {
    return 'shared';
  }
  if (/remote|manifest|remoteEntry|expose|container/i.test(text)) {
    return 'remote';
  }
  if (/host|ModuleFederationPlugin|federation/i.test(text)) {
    return 'host';
  }

  return 'build';
}

function createBuildErrorEvent(
  traceId: string,
  error: unknown,
  phase: ObservabilityBuildReportPhase,
): ObservabilityBuildEvent {
  const timestamp = Date.now();
  const errorName = getErrorName(error);
  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);
  const errorCode = extractErrorCode(
    `${errorName || ''}\n${errorMessage || ''}\n${errorStack || ''}`,
  );

  return {
    traceId,
    timestamp,
    phase: 'build',
    status: 'error',
    lifecycle: phase,
    failedPhase: phase,
    errorCode,
    errorName,
    errorMessage,
    errorStack,
    ownerHint: getBuildOwnerHint(error, phase),
    retryable: false,
    context: {
      lifecycle: phase,
    },
  };
}

function copyBuildErrorSummary(
  event: ObservabilityBuildEvent,
): ObservabilityBuildErrorSummary {
  return {
    errorCode: event.errorCode,
    errorName: event.errorName,
    errorMessage: event.errorMessage,
    failedPhase: event.failedPhase,
    ownerHint: event.ownerHint,
    retryable: event.retryable,
    context: event.context ? { ...event.context } : undefined,
  };
}

function createBuildFacts(
  buildInfo: ObservabilityBuildInfo,
  phase: ObservabilityBuildReportPhase,
  primaryError: ObservabilityBuildErrorSummary | undefined,
): ObservabilityBuildMetadata {
  const facts: Record<string, unknown> = {};
  const addFact = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    facts[key] = Array.isArray(value) ? value.join(',') : value;
  };

  addFact('source', 'build');
  addFact('status', 'error');
  addFact('outcome', 'failed');
  addFact('failedPhase', phase);
  addFact('errorCode', primaryError?.errorCode);
  addFact('errorName', primaryError?.errorName);
  addFact('ownerHint', primaryError?.ownerHint);
  addFact('retryable', primaryError?.retryable);
  addFact('bundlerName', buildInfo.bundler.name);
  addFact('bundlerVersion', buildInfo.bundler.version);
  addFact('buildMode', buildInfo.bundler.mode);
  addFact('buildTarget', buildInfo.bundler.target);
  addFact('mfName', buildInfo.moduleFederation.name);
  addFact('pluginVersion', buildInfo.moduleFederation.pluginVersion);
  addFact('buildVersion', buildInfo.moduleFederation.buildVersion);
  addFact('buildName', buildInfo.moduleFederation.buildName);
  addFact('remoteEntryName', buildInfo.moduleFederation.remoteEntry?.name);
  addFact('remoteEntryType', buildInfo.moduleFederation.remoteEntry?.type);
  addFact(
    'remoteEntryGlobalName',
    buildInfo.moduleFederation.remoteEntry?.globalName,
  );
  addFact(
    'publicPathMode',
    buildInfo.moduleFederation.remoteEntry?.publicPathMode,
  );
  addFact('remoteCount', buildInfo.summary.remoteCount);
  addFact('exposeCount', buildInfo.summary.exposeCount);
  addFact('sharedCount', buildInfo.summary.sharedCount);
  addFact(
    'remotes',
    buildInfo.moduleFederation.remotes
      .map((remote) => remote.alias || remote.name || remote.entry)
      .filter((value): value is string => Boolean(value)),
  );
  addFact(
    'exposes',
    buildInfo.moduleFederation.exposes.map((expose) => expose.name),
  );
  addFact(
    'shared',
    buildInfo.moduleFederation.shared.map((shared) => shared.name),
  );
  addFact(
    'eagerShared',
    buildInfo.moduleFederation.shared
      .filter((shared) => shared.eager)
      .map((shared) => shared.name),
  );

  return Object.entries(facts)
    .slice(0, MAX_BUILD_FACT_KEYS)
    .reduce<ObservabilityBuildMetadata>((memo, [key, value]) => {
      const sanitizedKey = sanitizeText(key, 80);
      if (!sanitizedKey) {
        return memo;
      }

      if (typeof value === 'boolean') {
        memo[sanitizedKey] = value;
        return memo;
      }

      if (typeof value === 'number') {
        if (Number.isFinite(value)) {
          memo[sanitizedKey] = value;
        }
        return memo;
      }

      const sanitizedValue = clipText(value, 240);
      if (sanitizedValue) {
        memo[sanitizedKey] = sanitizedValue;
      }

      return memo;
    }, {});
}

function createBuildActions(
  phase: ObservabilityBuildReportPhase,
  ownerHint: ObservabilityBuildOwnerHint,
): ObservabilityBuildAction[] {
  const actions: ObservabilityBuildAction[] = [];
  const pushAction = (
    id: string,
    title: string,
    hint: ObservabilityBuildOwnerHint = ownerHint,
  ) => {
    actions.push({
      id,
      ownerHint: hint,
      title,
    });
  };

  if (phase === 'observability-output') {
    pushAction(
      'check-observability-output',
      'Check observability output path permissions and filesystem availability',
      'build',
    );
    return actions;
  }

  pushAction(
    'inspect-build-errors',
    'Inspect the sanitized build error list for the first failing build phase',
    ownerHint,
  );

  if (ownerHint === 'shared') {
    pushAction(
      'check-shared-config',
      'Check shared dependency configuration, versions, and eager settings',
      'shared',
    );
  } else if (ownerHint === 'remote') {
    pushAction(
      'check-remote-config',
      'Check remoteEntry, remotes, exposes, and manifest build output',
      'remote',
    );
  } else {
    pushAction(
      'check-module-federation-config',
      'Check host Module Federation configuration and build options',
      ownerHint === 'host' ? 'host' : 'build',
    );
  }

  return actions;
}

function createBuildFactReport(
  buildInfo: ObservabilityBuildInfo,
  phase: ObservabilityBuildReportPhase,
  primaryError: ObservabilityBuildErrorSummary | undefined,
): ObservabilityBuildFactReport {
  const ownerHint = primaryError?.ownerHint || 'build';

  return {
    title:
      phase === 'observability-output'
        ? 'Build observability output failed'
        : 'Module Federation build failed',
    outcome: 'failed',
    status: 'error',
    ownerHint,
    failedPhase: phase,
    errorCode: primaryError?.errorCode,
    errorName: primaryError?.errorName,
    errorMessage: primaryError?.errorMessage,
    facts: createBuildFacts(buildInfo, phase, primaryError),
    completedPhases:
      phase === 'compilation' ? ['build-info'] : ['build-report'],
    pendingPhases: [],
    actions: createBuildActions(phase, ownerHint),
  };
}

function createBuildReport(
  buildInfo: ObservabilityBuildInfo,
  errors: unknown[],
  phase: ObservabilityBuildReportPhase,
  startedAt: number,
): ObservabilityBuildReport | undefined {
  const sanitizedErrors = errors.filter((error) => error !== undefined);
  if (!sanitizedErrors.length) {
    return undefined;
  }

  const traceId = `mf-build-${Date.now().toString(36)}`;
  const events = sanitizedErrors
    .slice(0, 20)
    .map((error) => createBuildErrorEvent(traceId, error, phase));
  const updatedAt = events[events.length - 1]?.timestamp || Date.now();
  const errorsSummary = events.map(copyBuildErrorSummary);
  const primaryError = errorsSummary[0];

  return {
    schemaVersion: 1,
    traceId,
    source: 'build',
    status: 'error',
    startedAt,
    updatedAt,
    duration: Math.max(0, updatedAt - startedAt),
    failedPhase: phase,
    build: buildInfo,
    events,
    summary: {
      eventCount: events.length,
      outcome: 'failed',
      error: primaryError,
      errors: errorsSummary,
    },
    diagnosis: createBuildFactReport(buildInfo, phase, primaryError),
  };
}

function getModuleFederationOptions(
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
): unknown {
  if (options.moduleFederation) {
    return options.moduleFederation;
  }

  const plugins = compiler.options?.['plugins'];
  if (!Array.isArray(plugins)) {
    return undefined;
  }

  for (const plugin of plugins) {
    const pluginRecord = getRecord(plugin);
    if (!pluginRecord) {
      continue;
    }

    const pluginName = getSanitizedString(pluginRecord['name'], 120);
    if (pluginName !== 'ModuleFederationPlugin') {
      continue;
    }

    return pluginRecord['_options'] || pluginRecord['options'];
  }

  return undefined;
}

function getCompilerOptions(compiler: CompilerLike) {
  return compiler.options || {};
}

function getBundlerFromCompiler(
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
) {
  if (options.bundler) {
    return options.bundler;
  }

  if (compiler.webpack?.rspackVersion) {
    return 'rspack';
  }

  return 'webpack';
}

function getBundlerVersionFromCompiler(
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
) {
  return options.bundlerVersion || compiler.webpack?.version;
}

function getProcessAssetsStage(
  compiler: CompilerLike,
  compilation: CompilationLike,
) {
  return (
    compilation.constructor?.PROCESS_ASSETS_STAGE_REPORT ||
    compiler.webpack?.Compilation?.PROCESS_ASSETS_STAGE_REPORT ||
    compilation.constructor?.PROCESS_ASSETS_STAGE_SUMMARIZE ||
    compiler.webpack?.Compilation?.PROCESS_ASSETS_STAGE_SUMMARIZE
  );
}

function getOutputFile(
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
) {
  return getResolvedOutputFile(options.outputFile || DEFAULT_OUTPUT_FILE, {
    cwd: options.cwd,
    compiler,
  });
}

function getResolvedOutputFile(
  outputFile: string,
  {
    cwd: configuredCwd,
    compiler,
  }: {
    cwd?: string;
    compiler: CompilerLike;
  },
) {
  const cwd =
    configuredCwd ||
    getString(compiler.options?.['context']) ||
    compiler.context ||
    process.cwd();

  return path.isAbsolute(outputFile)
    ? outputFile
    : path.resolve(cwd, outputFile);
}

function getBuildReportOutputFile(
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
) {
  const reportOptions = options.errorReport;
  const outputFile =
    reportOptions === false
      ? undefined
      : reportOptions?.outputFile || DEFAULT_REPORT_FILE;

  return outputFile
    ? getResolvedOutputFile(outputFile, { cwd: options.cwd, compiler })
    : undefined;
}

function writeBuildInfo(
  buildInfo: ObservabilityBuildInfo,
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
) {
  const outputFile = getOutputFile(options, compiler);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(
    outputFile,
    `${JSON.stringify(buildInfo, null, 2)}\n`,
    'utf8',
  );
}

function writeBuildReport(
  report: ObservabilityBuildReport,
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
) {
  const outputFile = getBuildReportOutputFile(options, compiler);
  if (!outputFile) {
    return;
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function removeStaleBuildReport(
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
) {
  const outputFile = getBuildReportOutputFile(options, compiler);
  if (!outputFile || !fs.existsSync(outputFile)) {
    return;
  }

  fs.rmSync(outputFile, { force: true });
}

function warn(
  compiler: CompilerLike,
  error: unknown,
  action = 'write build observability',
) {
  const message =
    getRawText(error instanceof Error ? error.message : String(error)) ||
    'unknown error';
  const logger = compiler.getInfrastructureLogger?.(PLUGIN_NAME);
  logger?.warn?.(`[${PLUGIN_NAME}] Failed to ${action}: ${message}`);
}

function writeBuildReportSafely(
  report: ObservabilityBuildReport | undefined,
  options: ObservabilityBuildPluginOptions,
  compiler: CompilerLike,
) {
  if (!report) {
    return;
  }

  try {
    writeBuildReport(report, options, compiler);
  } catch (error) {
    warn(compiler, error, 'write build observability report');
  }
}

export class ObservabilityBuildPlugin {
  readonly name = PLUGIN_NAME;
  private readonly options: ObservabilityBuildPluginOptions;

  constructor(options: ObservabilityBuildPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: CompilerLike): void {
    if (this.options.enabled === false) {
      return;
    }

    compiler.hooks?.thisCompilation?.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks?.processAssets?.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: getProcessAssetsStage(compiler, compilation),
        },
        async () => {
          const startedAt = Date.now();
          try {
            const moduleFederation = getModuleFederationOptions(
              this.options,
              compiler,
            );
            const fileNames = getManifestFileName(
              getRecord(moduleFederation)?.['manifest'],
            );
            const manifest = readJsonAsset(
              compilation,
              fileNames.manifestFileName,
            );
            const stats = readJsonAsset(compilation, fileNames.statsFileName);
            const buildInfo = createObservabilityBuildInfo({
              moduleFederation,
              manifest,
              stats,
              compilerOptions: getCompilerOptions(compiler),
              bundler: getBundlerFromCompiler(this.options, compiler),
              bundlerVersion: getBundlerVersionFromCompiler(
                this.options,
                compiler,
              ),
              pluginVersion: this.options.pluginVersion,
            });
            let observabilityOutputFailed = false;

            try {
              writeBuildInfo(buildInfo, this.options, compiler);
            } catch (error) {
              observabilityOutputFailed = true;
              warn(compiler, error);
              writeBuildReportSafely(
                createBuildReport(
                  buildInfo,
                  [error],
                  'observability-output',
                  startedAt,
                ),
                this.options,
                compiler,
              );
            }

            const compilationErrors = compilation.errors || [];
            if (compilationErrors.length) {
              writeBuildReportSafely(
                createBuildReport(
                  buildInfo,
                  compilationErrors,
                  'compilation',
                  startedAt,
                ),
                this.options,
                compiler,
              );
            } else if (!observabilityOutputFailed) {
              try {
                removeStaleBuildReport(this.options, compiler);
              } catch (error) {
                warn(
                  compiler,
                  error,
                  'remove stale build observability report',
                );
              }
            }
          } catch (error) {
            const fallbackBuildInfo = createObservabilityBuildInfo({
              moduleFederation: this.options.moduleFederation,
              compilerOptions: getCompilerOptions(compiler),
              bundler: getBundlerFromCompiler(this.options, compiler),
              bundlerVersion: getBundlerVersionFromCompiler(
                this.options,
                compiler,
              ),
              pluginVersion: this.options.pluginVersion,
            });

            warn(compiler, error);
            writeBuildReportSafely(
              createBuildReport(
                fallbackBuildInfo,
                [error],
                'observability-output',
                startedAt,
              ),
              this.options,
              compiler,
            );
          }
        },
      );
    });
  }
}
