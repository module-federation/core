// Generated from @module-federation/observability-plugin@2.4.0 dist/chrome-devtool.js + dist/core-SUVp26mD.js.
// This file is a ready-to-run chrome-devtool browser IIFE for MF live page observation.
(function (global) {
  var exports = {};
  var _module_federation_sdk = {
    isDebugMode: function () {
      try {
        if (
          typeof process !== 'undefined' &&
          process.env &&
          process.env.FEDERATION_DEBUG
        )
          return true;
      } catch {}
      try {
        if (
          typeof FEDERATION_DEBUG !== 'undefined' &&
          Boolean(FEDERATION_DEBUG)
        )
          return true;
      } catch {}
      try {
        if (
          global &&
          global.localStorage &&
          global.localStorage.getItem('FEDERATION_DEBUG')
        )
          return true;
      } catch {}
      return false;
    },
    createLogger: function (prefix) {
      return {
        debug: function () {
          if (!_module_federation_sdk.isDebugMode()) return;
          try {
            var logger =
              global &&
              global.console &&
              (global.console.debug || global.console.log);
            if (typeof logger === 'function')
              logger.apply(
                global.console,
                [prefix].concat(Array.prototype.slice.call(arguments)),
              );
          } catch {}
        },
      };
    },
  };

  //#region src/core.ts
  const DEFAULT_MAX_EVENTS = 100;
  const HARD_MAX_EVENTS = 1e3;
  const DEFAULT_COLLECTOR_PORT = 17891;
  const COLLECTOR_PATH = '/__mf_observability';
  const logger = (0, _module_federation_sdk.createLogger)(
    '[ Module Federation Observability Plugin ]',
  );
  const DEFAULT_DEVTOOLS_SOURCE = 'module-federation/observability';
  const COMPONENT_BUSINESS_LOADED_EVENT = 'component:business-loaded';
  const ON_MF_REMOTE_LOADED_PROP = 'onMFRemoteLoaded';
  const SENSITIVE_PAIR_PATTERN =
    /\b(token|authorization|cookie|secret|password|session|access_token|refresh_token|api_key|apikey|key)\s*[:=]\s*([^&\s'",;<>]+)/gi;
  const ERROR_CODE_PATTERN = /\b(?:RUNTIME|TYPE|BUILD)-\d{3}\b/;
  const URL_PATTERN = /https?:\/\/[^\s'"<>]+/g;
  const DIAGNOSTIC_DOC_LINK_PATTERN =
    /https?:\/\/module-federation\.io\/guide\/troubleshooting\/[^\s'"<>]+/i;
  const RUNTIME_DOC_LINK =
    'https://module-federation.io/guide/troubleshooting/runtime';
  const MAX_METADATA_KEYS = 20;
  const MAX_FACT_KEYS = 50;
  const MAX_MODULE_INFO_ENTRIES = 20;
  const HARD_MAX_REPORT_QUERY_LIMIT = 1e3;
  let traceCounter = 0;
  function isRecord(value) {
    return typeof value === 'object' && value !== null;
  }
  function normalizeMaxEvents(value, fallback) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
    return Math.max(1, Math.min(HARD_MAX_EVENTS, Math.floor(value)));
  }
  function normalizeQueryLimit(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return;
    return Math.max(
      1,
      Math.min(HARD_MAX_REPORT_QUERY_LIMIT, Math.floor(value)),
    );
  }
  function normalizeCollectorPort(value) {
    if (!Number.isFinite(value) || !value) return DEFAULT_COLLECTOR_PORT;
    const port = Math.floor(value);
    return port > 0 && port <= 65535 ? port : DEFAULT_COLLECTOR_PORT;
  }
  function normalizeCollectorOptions(value) {
    if (value === true)
      return {
        enabled: true,
        port: DEFAULT_COLLECTOR_PORT,
      };
    if (!value || value === false || value.enabled === false) return;
    return {
      enabled: true,
      port: normalizeCollectorPort(value.port),
    };
  }
  function normalizeDevtoolsOptions(value) {
    if (value === true)
      return {
        enabled: true,
        source: DEFAULT_DEVTOOLS_SOURCE,
      };
    if (!value || value === false || value.enabled === false) return;
    return {
      enabled: true,
      source: sanitizeText(value.source, 160) || DEFAULT_DEVTOOLS_SOURCE,
    };
  }
  function getCollectorUrl(port) {
    return `http://127.0.0.1:${port}${COLLECTOR_PATH}`;
  }
  function sanitizeText(value, maxLength = 800) {
    if (value === void 0 || value === null) return;
    const sanitized = String(value)
      .replace(URL_PATTERN, (url) => sanitizeUrl(url) || '[redacted-url]')
      .replace(SENSITIVE_PAIR_PATTERN, '[redacted]');
    return sanitized.length > maxLength
      ? `${sanitized.slice(0, maxLength)}...`
      : sanitized;
  }
  function getRawText(value) {
    if (value === void 0 || value === null) return;
    return String(value);
  }
  function clipText(value, maxLength = 320) {
    if (value === void 0 || value === null) return;
    const sanitized = String(value);
    return sanitized.length > maxLength
      ? `${sanitized.slice(0, maxLength)}...`
      : sanitized;
  }
  function clipObservabilityMetadata(metadata, maxKeys = MAX_METADATA_KEYS) {
    if (!metadata || typeof metadata !== 'object') return;
    const clipped = {};
    Object.entries(metadata)
      .slice(0, maxKeys)
      .forEach(([rawKey, rawValue]) => {
        const key = clipText(rawKey, 80);
        if (!key || rawValue === void 0 || rawValue === null) return;
        if (typeof rawValue === 'boolean') {
          clipped[key] = rawValue;
          return;
        }
        if (typeof rawValue === 'number') {
          if (Number.isFinite(rawValue)) clipped[key] = rawValue;
          return;
        }
        const value = clipText(rawValue, 240);
        if (value) clipped[key] = value;
      });
    return Object.keys(clipped).length ? clipped : void 0;
  }
  function clipMetadata(metadata, maxKeys = MAX_METADATA_KEYS) {
    if (!metadata || typeof metadata !== 'object') return;
    const clipped = {};
    Object.entries(metadata)
      .slice(0, maxKeys)
      .forEach(([rawKey, rawValue]) => {
        const key = sanitizeText(rawKey, 80);
        if (!key || rawValue === void 0 || rawValue === null) return;
        if (typeof rawValue === 'boolean') {
          clipped[key] = rawValue;
          return;
        }
        if (typeof rawValue === 'number') {
          if (Number.isFinite(rawValue)) clipped[key] = rawValue;
          return;
        }
        const value = clipText(rawValue, 240);
        if (value) clipped[key] = value;
      });
    return Object.keys(clipped).length ? clipped : void 0;
  }
  function sanitizeStack(stack, options) {
    if (!stack || options?.enabled === false) return;
    return stack;
  }
  function getRawStack(error) {
    if (error instanceof Error) return error.stack || error.message;
  }
  function sanitizeRequestId(value) {
    if (!value) return;
    return clipText(value, 240);
  }
  function sanitizeUrl(value) {
    if (!value) return;
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
  function sanitizeRemote(remote) {
    if (!remote || !remote.name) return;
    return {
      name: remote.name,
      alias: sanitizeText(remote.alias, 120),
      entry: clipText(remote.entry, 320),
      entryGlobalName: sanitizeText(remote.entryGlobalName, 120),
      type: sanitizeText(remote.type, 80),
    };
  }
  function createRemoteInfo(remote) {
    if (!remote?.name) return;
    return {
      name: remote.name,
      alias: remote.alias,
      entry: remote.entry,
      entryGlobalName: remote.entryGlobalName,
      type: remote.type,
    };
  }
  function isManifestUrl(value) {
    const sanitized = sanitizeUrl(value);
    return Boolean(sanitized && /manifest.*\.json$/i.test(sanitized));
  }
  function normalizeSharedScope(value) {
    if (!value) return [];
    return (Array.isArray(value) ? value : [value])
      .map((scope) => sanitizeText(scope, 120))
      .filter((scope) => Boolean(scope));
  }
  function getSharedScopes(shareInfo) {
    return normalizeSharedScope(shareInfo?.scope).length
      ? normalizeSharedScope(shareInfo?.scope)
      : ['default'];
  }
  function getAvailableSharedVersions(args) {
    const versions = /* @__PURE__ */ new Set();
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
  function getSharedMissReason(args) {
    if (!args.shareInfo) return 'missing-config';
    return getAvailableSharedVersions(args).length
      ? 'version-mismatch'
      : 'missing-provider';
  }
  function getSharedErrorReason(args) {
    if (args.recovered) return getSharedMissReason(args);
    const errorMessage =
      getErrorInfo(args.error, { enabled: false }).errorMessage || '';
    if (!args.shareInfo || /Cannot find shared/i.test(errorMessage))
      return 'missing-config';
    if (
      args.lifecycle === 'loadShareSync' &&
      typeof args.shareInfo.get === 'function' &&
      /RUNTIME-00[56]/.test(errorMessage)
    )
      return 'sync-async-boundary';
    if (
      args.lifecycle === 'loadShareSync' &&
      !args.shareInfo.get &&
      /RUNTIME-006/.test(errorMessage)
    )
      return getSharedMissReason(args);
    if (args.error) return 'load-error';
  }
  function parseStableVersion(version) {
    const matched = version?.match(/^(\d+)\.(\d+)\.(\d+)(?:\+[\w.-]+)?$/);
    if (!matched) return;
    return {
      major: Number(matched[1]),
      minor: Number(matched[2]),
      patch: Number(matched[3]),
    };
  }
  function isVersionAtLeast(version, target) {
    if (version.major !== target.major) return version.major > target.major;
    if (version.minor !== target.minor) return version.minor > target.minor;
    return version.patch >= target.patch;
  }
  function supportsRuntimeObservability(origin) {
    const version = parseStableVersion(origin?.version);
    if (!version) return false;
    return isVersionAtLeast(version, {
      major: 2,
      minor: 5,
      patch: 0,
    });
  }
  function createSharedInfo(args, reason) {
    const shareConfig = args.shareInfo?.shareConfig;
    return {
      name: args.pkgName,
      shareScope: getSharedScopes(args.shareInfo),
      requiredVersion: shareConfig?.requiredVersion,
      selectedVersion: args.selectedShared?.version,
      availableVersions: getAvailableSharedVersions(args),
      provider: args.selectedShared?.from,
      from: args.shareInfo?.from,
      singleton: shareConfig?.singleton,
      strictVersion: shareConfig?.strictVersion,
      eager: shareConfig?.eager,
      strategy: args.shareInfo?.strategy,
      loaded: args.selectedShared?.loaded,
      loading: Boolean(args.selectedShared?.loading) || void 0,
      reason,
    };
  }
  function sanitizeShared(shared) {
    if (!shared || !shared.name) return;
    return {
      name: sanitizeText(shared.name, 160) || 'unknown',
      shareScope: normalizeSharedScope(shared.shareScope),
      requiredVersion:
        shared.requiredVersion === false
          ? false
          : sanitizeText(shared.requiredVersion, 120),
      selectedVersion: sanitizeText(shared.selectedVersion, 120),
      availableVersions: (shared.availableVersions || [])
        .map((version) => sanitizeText(version, 120))
        .filter((version) => Boolean(version))
        .slice(0, 20),
      provider: sanitizeText(shared.provider, 160),
      from: sanitizeText(shared.from, 160),
      singleton: shared.singleton,
      strictVersion: shared.strictVersion,
      eager: shared.eager,
      strategy: sanitizeText(shared.strategy, 80),
      loaded: shared.loaded,
      loading: shared.loading,
      reason: sanitizeText(shared.reason, 120),
    };
  }
  function getObjectValue(value, key) {
    return value[key];
  }
  function isReactLike(value) {
    if (!isRecord(value)) return false;
    return typeof getObjectValue(value, 'createElement') === 'function';
  }
  function resolveReactLike(value) {
    if (isReactLike(value)) return value;
    if (isRecord(value)) {
      const defaultExport = getObjectValue(value, 'default');
      if (isReactLike(defaultExport)) return defaultExport;
    }
  }
  function getReactComponentName(component, fallback) {
    if (typeof component === 'function')
      return component.displayName || component.name || fallback;
    if (!isRecord(component)) return fallback;
    const displayName = getObjectValue(component, 'displayName');
    if (typeof displayName === 'string' && displayName) return displayName;
    const render = getObjectValue(component, 'render');
    if (typeof render === 'function')
      return render.displayName || render.name || fallback;
    return fallback;
  }
  function isLikelyReactFunctionComponent(
    component,
    allowAnonymousComponent = false,
  ) {
    if (typeof component !== 'function') return false;
    const name = component.displayName || component.name || '';
    if (/^use[A-Z0-9]/.test(name)) return false;
    if (allowAnonymousComponent) return true;
    if (!name) return false;
    return /^[A-Z]/.test(name);
  }
  function copyComponentStatics(target, source) {
    const reserved = new Set([
      'arguments',
      'caller',
      'length',
      'name',
      'prototype',
      'displayName',
    ]);
    Object.getOwnPropertyNames(source).forEach((key) => {
      if (reserved.has(key)) return;
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (!descriptor || !descriptor.configurable) return;
      try {
        Object.defineProperty(target, key, descriptor);
      } catch {}
    });
  }
  function cloneModuleWithDefaultExport(moduleExports, defaultExport) {
    const descriptors = Object.getOwnPropertyDescriptors(moduleExports);
    descriptors.default = {
      configurable: true,
      enumerable: descriptors.default?.enumerable ?? true,
      writable: true,
      value: defaultExport,
    };
    return Object.defineProperties(
      Object.create(Object.getPrototypeOf(moduleExports)),
      descriptors,
    );
  }
  function resolveReactComponentTarget(
    component,
    defaultExportMode = 'preserve',
    allowAnonymousComponent = false,
  ) {
    if (isLikelyReactFunctionComponent(component, allowAnonymousComponent))
      return {
        component,
        createResult: (wrappedComponent) => wrappedComponent,
      };
    if (!isRecord(component)) return;
    const defaultExport = getObjectValue(component, 'default');
    if (!isLikelyReactFunctionComponent(defaultExport, allowAnonymousComponent))
      return;
    return {
      component: defaultExport,
      createResult: (wrappedComponent) => {
        const descriptor = Object.getOwnPropertyDescriptor(
          component,
          'default',
        );
        let defaultExportReplaced = false;
        try {
          if (!descriptor || descriptor.writable || descriptor.set) {
            component.default = wrappedComponent;
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
        } catch {}
        if (defaultExportMode === 'component') return wrappedComponent;
        return defaultExportReplaced
          ? void 0
          : cloneModuleWithDefaultExport(component, wrappedComponent);
      },
    };
  }
  function normalizeEventSource(value) {
    return value === 'runtime' || value === 'business' || value === 'react'
      ? value
      : void 0;
  }
  function extractErrorCode(value) {
    const matched = String(value ?? '').match(ERROR_CODE_PATTERN)?.[0];
    return matched ? sanitizeText(matched, 40) : void 0;
  }
  function getErrorInfo(error, stackTraceOptions) {
    if (!error) return {};
    if (error instanceof Error)
      return {
        errorCode: extractErrorCode(
          `${error.name}\n${error.message}\n${error.stack || ''}`,
        ),
        errorName: getRawText(error.name),
        errorMessage: getRawText(error.message),
        errorStack: sanitizeStack(error.stack, stackTraceOptions),
      };
    return {
      errorCode: extractErrorCode(error),
      errorMessage: getRawText(error),
    };
  }
  function omitUndefinedFields(value) {
    if (Array.isArray(value))
      return value.map((item) => omitUndefinedFields(item));
    if (!value || typeof value !== 'object') return value;
    const cleanValue = {};
    Object.entries(value).forEach(([key, item]) => {
      if (item === void 0) return;
      cleanValue[key] = omitUndefinedFields(item);
    });
    return cleanValue;
  }
  function copyEvent(event) {
    return omitUndefinedFields({
      ...event,
      remote: event.remote ? { ...event.remote } : void 0,
      shared: event.shared
        ? {
            ...event.shared,
            shareScope: event.shared.shareScope
              ? [...event.shared.shareScope]
              : void 0,
            availableVersions: event.shared.availableVersions
              ? [...event.shared.availableVersions]
              : void 0,
          }
        : void 0,
      errorContext: event.errorContext ? { ...event.errorContext } : void 0,
      metadata: event.metadata ? { ...event.metadata } : void 0,
      loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
    });
  }
  function copySummary(summary) {
    return {
      ...summary,
      phases: Object.entries(summary.phases).reduce(
        (memo, [phase, phaseSummary]) => {
          memo[phase] = { ...phaseSummary };
          return memo;
        },
        {},
      ),
      shared: summary.shared
        ? {
            ...summary.shared,
            shareScope: summary.shared.shareScope
              ? [...summary.shared.shareScope]
              : void 0,
          }
        : void 0,
      flags: { ...summary.flags },
      error: summary.error
        ? {
            ...summary.error,
            context: summary.error.context
              ? { ...summary.error.context }
              : void 0,
          }
        : void 0,
    };
  }
  function copyFactReport(diagnosis) {
    if (!diagnosis) return;
    return {
      ...diagnosis,
      facts: { ...diagnosis.facts },
      completedPhases: [...diagnosis.completedPhases],
      pendingPhases: [...diagnosis.pendingPhases],
      warnings: diagnosis.warnings ? [...diagnosis.warnings] : void 0,
      actions: diagnosis.actions.map((action) => ({ ...action })),
    };
  }
  function copyModuleInfoSummary(moduleInfo) {
    if (!moduleInfo) return;
    return {
      ...moduleInfo,
      entries: moduleInfo.entries.map((entry) => ({ ...entry })),
      availableNames: moduleInfo.availableNames
        ? [...moduleInfo.availableNames]
        : void 0,
    };
  }
  function copyLoadedBeforeInfo(loadedBefore) {
    if (!loadedBefore) return;
    return {
      producer: loadedBefore.producer,
      expose: loadedBefore.expose,
      consumers: loadedBefore.consumers.map((consumer) => ({
        ...consumer,
        exposes: consumer.exposes ? [...consumer.exposes] : void 0,
      })),
    };
  }
  function copyReport(report) {
    return omitUndefinedFields({
      ...report,
      remote: report.remote ? { ...report.remote } : void 0,
      shared: report.shared
        ? {
            ...report.shared,
            shareScope: report.shared.shareScope
              ? [...report.shared.shareScope]
              : void 0,
            availableVersions: report.shared.availableVersions
              ? [...report.shared.availableVersions]
              : void 0,
          }
        : void 0,
      errorContext: report.errorContext ? { ...report.errorContext } : void 0,
      moduleInfo: copyModuleInfoSummary(report.moduleInfo),
      loadedBefore: copyLoadedBeforeInfo(report.loadedBefore),
      events: report.events.map(copyEvent),
      summary: copySummary(report.summary),
      diagnosis: copyFactReport(report.diagnosis),
    });
  }
  function getFederationGlobal() {
    return globalThis.__FEDERATION__;
  }
  function normalizeExposeName(value) {
    const sanitized = sanitizeText(value, 240);
    if (!sanitized) return;
    return sanitized.replace(/^\.\//, '');
  }
  function getModuleCacheEntries(moduleCache) {
    if (!moduleCache) return [];
    if (moduleCache instanceof Map) return Array.from(moduleCache.values());
    const entries =
      typeof moduleCache.entries === 'function'
        ? Array.from(moduleCache.entries())
        : void 0;
    if (entries) return entries.map(([, value]) => value);
    if (isRecord(moduleCache)) return Object.values(moduleCache);
    return [];
  }
  function getLoadedExposesForRemote(instance, remoteName) {
    if (!remoteName) return [];
    return Array.from(
      new Set(
        Object.values(instance.remoteHandler?.idToRemoteMap || {})
          .filter((item) => item?.name === remoteName)
          .map((item) => sanitizeText(item.expose, 240))
          .filter((expose) => Boolean(expose)),
      ),
    );
  }
  function collectLoadedBeforeInfo(remote, expose, origin) {
    const entryGlobalName = remote?.entryGlobalName;
    if (!entryGlobalName) return;
    const federation = getFederationGlobal();
    const instances = Array.isArray(federation?.__INSTANCES__)
      ? federation.__INSTANCES__
      : [];
    const targetExpose = normalizeExposeName(expose);
    const consumers = [];
    instances.forEach((instance) => {
      if (instance === origin) return;
      const matchedModule = getModuleCacheEntries(instance.moduleCache).find(
        (item) =>
          isRecord(item) &&
          isRecord(item.remoteInfo) &&
          item.remoteInfo.entryGlobalName === entryGlobalName,
      );
      if (!matchedModule) return;
      const exposes = getLoadedExposesForRemote(
        instance,
        matchedModule.remoteInfo?.name,
      );
      const consumer = {
        name:
          sanitizeText(instance.options?.name, 120) ||
          sanitizeText(instance.name, 120),
        remoteEntryExports: Boolean(matchedModule.remoteEntryExports),
        containerInitialized: matchedModule.inited === true,
        exposes: exposes.length ? exposes : void 0,
      };
      consumers.push(omitUndefinedFields(consumer));
    });
    if (!consumers.length) return;
    return {
      producer: true,
      expose: targetExpose
        ? consumers.some((consumer) =>
            (consumer.exposes || []).some(
              (loadedExpose) =>
                normalizeExposeName(loadedExpose) === targetExpose,
            ),
          )
        : false,
      consumers,
    };
  }
  function normalizeScope(value) {
    return sanitizeText(value, 120)?.replace(/[^\w:@.-]+/g, '-') || 'default';
  }
  function shouldRecordEvent(level, event) {
    if (level === 'verbose') return true;
    if (level === 'summary') return event.status !== 'start';
    return event.status === 'error' || Boolean(event.error);
  }
  function createTraceId(event) {
    traceCounter += 1;
    return `mf-${(event.remote?.name || event.phase || 'runtime').replace(/[^a-z0-9]+/gi, '-').slice(0, 80)}-${Date.now().toString(36)}-${traceCounter.toString(36)}`;
  }
  function getPhaseDurationKey(event) {
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
  function getRemoteEntryKey(remote) {
    if (!remote?.name) return;
    return [remote.name, remote.entryGlobalName || '', remote.entry || ''].join(
      '|',
    );
  }
  function getHostRemotesSummary(options) {
    const remotes = (options?.remotes || [])
      .map((remote) =>
        clipText(remote.alias || remote.name || remote.entry, 120),
      )
      .filter((remote) => Boolean(remote))
      .slice(0, 20);
    return remotes.length ? remotes.join(',') : void 0;
  }
  function resolveRemoteFromRequestId(id, options) {
    if (!id) return;
    const matchedRemote = (options?.remotes || [])
      .filter((remote) => {
        return [remote.alias, remote.name]
          .filter((key) => Boolean(key))
          .some((key) => id === key || id.startsWith(`${key}/`));
      })
      .sort((left, right) => {
        const leftKey = left.alias || left.name || '';
        return (right.alias || right.name || '').length - leftKey.length;
      })[0];
    return createRemoteInfo(matchedRemote);
  }
  function resolveAliasRequestId(requestId, remote) {
    if (!requestId || !remote?.alias || remote.alias === remote.name) return;
    if (requestId === remote.name) return remote.alias;
    if (requestId.startsWith(`${remote.name}/`))
      return `${remote.alias}/${requestId.slice(remote.name.length + 1)}`;
  }
  function sanitizeModuleInfoPath(value) {
    if (typeof value !== 'string') return;
    return clipText(value, 320);
  }
  function sanitizeModuleInfoGetPublicPath(value) {
    if (typeof value !== 'string') return;
    return clipText(value, 500);
  }
  function sanitizeModuleInfoRemoteEntry(value) {
    if (typeof value !== 'string') return;
    return clipText(value, 320);
  }
  function createClippedModuleInfoEntry(rawName, rawValue) {
    const name = clipText(rawName, 240);
    if (!name) return;
    const value = isRecord(rawValue) ? rawValue : {};
    return {
      name,
      publicPath: sanitizeModuleInfoPath(value['publicPath']),
      getPublicPath: sanitizeModuleInfoGetPublicPath(value['getPublicPath']),
      remoteEntry: sanitizeModuleInfoRemoteEntry(value['remoteEntry']),
      globalName: sanitizeText(value['globalName'], 160),
    };
  }
  function normalizeModuleInfoLookupValue(value) {
    if (typeof value !== 'string' || !value) return;
    return (
      /^https?:\/\//i.test(value) || value.startsWith('/')
        ? sanitizeUrl(value)
        : sanitizeText(value, 240)
    )?.toLowerCase();
  }
  function getModuleInfoLookupValues(report) {
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
        .filter((value) => Boolean(value)),
    );
  }
  function matchesModuleInfoLookup(entry, lookupValues) {
    if (!lookupValues.size) return false;
    return [
      entry.name,
      entry.publicPath,
      entry.getPublicPath,
      entry.remoteEntry,
      entry.globalName,
    ]
      .map(normalizeModuleInfoLookupValue)
      .filter((value) => Boolean(value))
      .some((entryValue) =>
        Array.from(lookupValues).some(
          (lookupValue) =>
            entryValue === lookupValue ||
            entryValue.startsWith(`${lookupValue}:`) ||
            entryValue.includes(`:${lookupValue}`) ||
            (lookupValue.startsWith('http') &&
              entryValue.includes(lookupValue)),
        ),
      );
  }
  function getModuleInfoCaptureReason(report) {
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
    if (/RUNTIME-007/.test(text)) return 'remote-snapshot';
    if (/RUNTIME-011/.test(text)) return 'remote-entry-missing-in-snapshot';
    if (/moduleInfo|module info/i.test(text)) return 'module-info';
    if (/remote snapshot|global snapshot|snapshot/i.test(text))
      return 'remote-snapshot';
  }
  function createModuleInfoSummary(report) {
    const reason = getModuleInfoCaptureReason(report);
    if (!reason) return;
    const moduleInfo = getFederationGlobal()?.moduleInfo;
    const rawEntries = isRecord(moduleInfo) ? Object.entries(moduleInfo) : [];
    const clippedEntries = rawEntries
      .map(([name, value]) => createClippedModuleInfoEntry(name, value))
      .filter((entry) => Boolean(entry));
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
        ? void 0
        : clippedEntries
            .map((entry) => entry.name)
            .slice(0, MAX_MODULE_INFO_ENTRIES),
    };
  }
  function getResourceErrorType(event) {
    const text = `${event.errorMessage || ''}\n${event.message || ''}`;
    if (!event.errorCode && !text) return;
    if (/ScriptExecutionError/i.test(text)) return 'script-execution';
    if (/timeout|timed out/i.test(text)) return 'timeout';
    if (
      /ScriptNetworkError|NetworkError|Failed to fetch|Request failed|ERR_|404|CORS/i.test(
        text,
      )
    )
      return 'network';
    return event.errorCode === 'RUNTIME-008' ? 'unknown' : void 0;
  }
  function getOwnerHint(event) {
    const resourceErrorType = getResourceErrorType(event);
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
        return resourceErrorType === 'network' ||
          resourceErrorType === 'timeout'
          ? 'network'
          : 'remote';
      default:
        if (event.shared) return 'shared';
        if (event.remote) return 'remote';
        if (event.phase === 'manifest' || event.phase === 'matchRemote')
          return 'host';
        return event.errorCode ? 'runtime' : void 0;
    }
  }
  function getRetryable(event) {
    const resourceErrorType = getResourceErrorType(event);
    if (event.errorCode === 'RUNTIME-008')
      return resourceErrorType === 'network' || resourceErrorType === 'timeout';
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
    )
      return false;
  }
  function createErrorContext(event, inputContext) {
    const context = { ...inputContext };
    if (event.lifecycle) context.lifecycle = event.lifecycle;
    if (event.requestId) context.requestId = event.requestId;
    if (event.requestAlias) context.requestAlias = event.requestAlias;
    if (event.remote?.name) context.remoteName = event.remote.name;
    if (event.remote?.alias) context.remoteAlias = event.remote.alias;
    if (event.remote?.type) context.remoteType = event.remote.type;
    if (event.remote?.entryGlobalName)
      context.entryGlobalName = event.remote.entryGlobalName;
    if (event.sanitizedUrl) context.url = event.sanitizedUrl;
    if (event.expose) context.expose = event.expose;
    if (event.shared?.name) context.shareName = event.shared.name;
    if (event.shared?.requiredVersion)
      context.requiredVersion = event.shared.requiredVersion;
    if (event.shared?.selectedVersion)
      context.selectedVersion = event.shared.selectedVersion;
    if (event.shared?.provider) context.provider = event.shared.provider;
    const resourceErrorType = getResourceErrorType(event);
    if (resourceErrorType) context.resourceErrorType = resourceErrorType;
    return clipObservabilityMetadata(context);
  }
  function createObservability(rawOptions = {}, adapterOptions = {}) {
    const options = {
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
    const shouldDisablePreloadHooks =
      adapterOptions.disablePreloadHooks === true;
    const shouldReturnHookArgs = adapterOptions.returnHookArgs === true;
    const shouldForceDevelopmentChannels =
      adapterOptions.forceDevelopmentChannels === true;
    const returnHookArgs = (args) => (shouldReturnHookArgs ? args : void 0);
    const level = options.level || 'summary';
    const configuredMaxEvents = normalizeMaxEvents(
      options.maxEvents,
      DEFAULT_MAX_EVENTS,
    );
    const events = [];
    const reports = /* @__PURE__ */ new Map();
    const traceByRequest = /* @__PURE__ */ new Map();
    const traceByRemote = /* @__PURE__ */ new Map();
    const phaseStartTimes = /* @__PURE__ */ new Map();
    const collectorOptions = normalizeCollectorOptions(options.collector);
    const devtoolsOptions = normalizeDevtoolsOptions(options.devtools);
    const seenManifestUrls = /* @__PURE__ */ new Set();
    const loadingManifestUrls = /* @__PURE__ */ new Set();
    const seenRemoteEntryKeys = /* @__PURE__ */ new Set();
    const consoleReportedTraceIds = /* @__PURE__ */ new Set();
    const consoleReportedStartKeys = /* @__PURE__ */ new Set();
    let latestTraceId;
    let runtimeObservabilityEnabled = false;
    let suppressRuntimeEvents = false;
    let effectiveMaxEvents = configuredMaxEvents;
    let browserGlobalScope;
    let lastRuntimeOrigin;
    let appliedRuntimeVersion;
    const isEnabled = () => {
      if (options.enabled === false) return false;
      runtimeObservabilityEnabled = true;
      return true;
    };
    const resolveTraceId = (event) => {
      const sanitizedRequestId = sanitizeRequestId(event.requestId);
      if (event.traceId && reports.has(event.traceId)) return event.traceId;
      if (event.status === 'start' && event.phase === 'loadRemote') {
        const traceId = event.traceId || createTraceId(event);
        if (sanitizedRequestId) traceByRequest.set(sanitizedRequestId, traceId);
        if (event.remote?.name) traceByRemote.set(event.remote.name, traceId);
        return traceId;
      }
      if (sanitizedRequestId) {
        const traceId = traceByRequest.get(sanitizedRequestId);
        if (traceId) return traceId;
      }
      if (event.remote?.name) {
        const traceId = traceByRemote.get(event.remote.name);
        if (traceId) return traceId;
      }
      return event.traceId || createTraceId(event);
    };
    const normalizeEvent = (event, traceId, origin) => {
      const errorInfo = getErrorInfo(event.error, options.stackTrace);
      const sanitizedRemote = sanitizeRemote(event.remote);
      const sanitizedShared = sanitizeShared(event.shared);
      const requestAlias =
        sanitizeRequestId(event.requestAlias) ||
        resolveAliasRequestId(event.requestId, sanitizedRemote);
      const hostName =
        sanitizeText(event.hostName, 120) ||
        sanitizeText(origin?.options?.name, 120);
      const runtimeVersion =
        sanitizeText(origin?.version, 80) || appliedRuntimeVersion;
      const message = getRawText(event.message) || errorInfo.errorMessage;
      const normalizedEvent = {
        traceId,
        timestamp: event.timestamp || Date.now(),
        phase: sanitizeText(event.phase, 120) || 'runtime',
        status: event.status,
        requestId: sanitizeRequestId(event.requestId),
        requestAlias,
        hostName,
        runtimeVersion,
        remote: sanitizedRemote,
        shared: sanitizedShared,
        expose: sanitizeText(event.expose, 240),
        sanitizedUrl: clipText(event.url || event.remote?.entry, 320),
        message,
        errorCode: errorInfo.errorCode,
        errorName: errorInfo.errorName,
        errorMessage: errorInfo.errorMessage,
        errorStack: errorInfo.errorStack,
        duration:
          typeof event.duration === 'number' && Number.isFinite(event.duration)
            ? Math.max(0, event.duration)
            : void 0,
        lifecycle: sanitizeText(event.lifecycle, 120),
        eventName: sanitizeText(event.eventName, 160),
        source: normalizeEventSource(event.source),
        recovered: event.recovered === true || void 0,
        cached: event.cached === true || void 0,
        componentName: sanitizeText(event.componentName, 160),
        metadata: clipObservabilityMetadata(event.metadata),
        loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
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
    const supportsRuntimeHookObservability = (origin) =>
      supportsRuntimeObservability({
        ...origin,
        version:
          sanitizeText(origin?.version, 80) ||
          appliedRuntimeVersion ||
          origin?.version,
      });
    const shouldSkipRuntimeHook = (origin) =>
      shouldGuardRuntimeHooksByRuntimeVersion &&
      !supportsRuntimeHookObservability(origin);
    const applyPhaseDuration = (event) => {
      const key = getPhaseDurationKey(event);
      if (event.status === 'start') {
        phaseStartTimes.set(key, event.timestamp);
        return;
      }
      if (event.duration !== void 0) return;
      const startedAt = phaseStartTimes.get(key);
      if (startedAt === void 0) return;
      event.duration = Math.max(0, event.timestamp - startedAt);
      phaseStartTimes.delete(key);
    };
    const updateTraceMaps = (event) => {
      if (event.requestId) traceByRequest.set(event.requestId, event.traceId);
      if (event.remote?.name)
        traceByRemote.set(event.remote.name, event.traceId);
    };
    const trimEvents = (report) => {
      while (events.length > effectiveMaxEvents) events.shift();
      while (report.events.length > effectiveMaxEvents) report.events.shift();
    };
    const getEventOutcome = (event) => {
      if (event.status === 'success') return 'success';
      if (event.status === 'error') return 'error';
      if (event.status === 'complete') {
        if (event.recovered) return 'recovered';
        if (event.errorName || event.errorMessage) return 'error';
      }
    };
    const isLoadRemoteCompleteEvent = (event) =>
      event.phase === 'loadRemote' && event.status === 'complete';
    const isRuntimeLoadedEvent = (event) =>
      event.phase === 'loadRemote' &&
      (event.status === 'success' ||
        (event.status === 'complete' && event.recovered));
    const isSharedResolvedEvent = (event) =>
      event.phase === 'shared' &&
      (event.status === 'success' ||
        (event.status === 'complete' && event.recovered));
    const isPreloadedEvent = (event) =>
      event.phase === 'preload' && event.status === 'success';
    const isComponentLoadedEvent = (event) =>
      event.status === 'success' &&
      (event.eventName === COMPONENT_BUSINESS_LOADED_EVENT ||
        (event.phase === 'component' &&
          event.message === COMPONENT_BUSINESS_LOADED_EVENT));
    const shouldReplaceFailedPhase = (report, event) => {
      if (isLoadRemoteCompleteEvent(event) && report.failedPhase) return false;
      if (!report.failedPhase) return true;
      return (
        report.failedPhase === 'loadRemote' && event.phase !== 'loadRemote'
      );
    };
    const createEmptyPhaseCollection = () => ({
      phases: {},
      flags: {
        cached: false,
        fallback: false,
        recovered: false,
      },
    });
    const createPhaseCollection = (eventsForReport) => {
      const collection = createEmptyPhaseCollection();
      eventsForReport.forEach((event) => {
        const phase = event.phase;
        const phaseSummary = collection.phases[phase] || {
          status: event.status,
        };
        if (event.status !== 'start') phaseSummary.status = event.status;
        if (event.duration !== void 0) phaseSummary.duration = event.duration;
        if (event.cached) {
          phaseSummary.cached = true;
          collection.flags.cached = true;
        }
        if (event.recovered) {
          phaseSummary.recovered = true;
          collection.flags.recovered = true;
        }
        if (event.lifecycle) phaseSummary.lifecycle = event.lifecycle;
        collection.phases[phase] = phaseSummary;
        if (
          event.phase === 'loadRemote' &&
          event.status === 'complete' &&
          event.recovered
        )
          collection.flags.fallback = true;
        if (event.shared?.selectedVersion || event.shared?.provider)
          collection.shared = {
            name: event.shared.name,
            provider: event.shared.provider,
            selectedVersion: event.shared.selectedVersion,
            shareScope: event.shared.shareScope
              ? [...event.shared.shareScope]
              : void 0,
          };
      });
      return collection;
    };
    const createErrorSummary = (eventsForReport, failedPhase) => {
      const errorEvent =
        eventsForReport.find(
          (event) => event.status === 'error' && event.phase === failedPhase,
        ) ||
        eventsForReport.find((event) => event.status === 'error') ||
        eventsForReport.find(
          (event) => event.status === 'complete' && event.errorMessage,
        );
      if (!errorEvent) return;
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
          : void 0,
      };
    };
    const createReportSummary = (report) => {
      const loadCompleted = report.events.some(isLoadRemoteCompleteEvent);
      const runtimeLoaded = report.events.some(isRuntimeLoadedEvent);
      const sharedResolved = report.events.some(isSharedResolvedEvent);
      const preloaded = report.events.some(isPreloadedEvent);
      const recovered = report.events.some((item) => item.recovered);
      const componentLoaded = report.events.some(isComponentLoadedEvent);
      const lastEvent = report.events[report.events.length - 1];
      let outcome = 'pending';
      if (recovered) outcome = 'recovered';
      else if (componentLoaded) outcome = 'component-loaded';
      else if (report.status === 'error') outcome = 'failed';
      else if (runtimeLoaded) outcome = 'runtime-loaded';
      else if (sharedResolved) outcome = 'shared-resolved';
      else if (preloaded) outcome = 'preloaded';
      const phaseCollection = createPhaseCollection(report.events);
      return {
        eventCount: report.events.length,
        recovered,
        loadCompleted,
        runtimeLoaded,
        sharedResolved,
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
    const refreshModuleInfoSummary = (report) => {
      const moduleInfo = createModuleInfoSummary(report);
      if (moduleInfo) report.moduleInfo = moduleInfo;
    };
    const getReportContext = (report) =>
      report.summary.error?.context || report.errorContext;
    const getContextText = (context, key) => {
      const value = context?.[key];
      return typeof value === 'string' && value ? value : void 0;
    };
    const getDiagnosisOwnerHint = (report) =>
      report.summary.error?.ownerHint ||
      report.ownerHint ||
      (report.shared ? 'shared' : report.remote ? 'remote' : 'unknown');
    const getDiagnosisResourceErrorType = (report) =>
      getContextText(getReportContext(report), 'resourceErrorType') ||
      getResourceErrorType({
        errorCode: report.errorCode,
        errorMessage: report.errorMessage,
        message: report.events.at(-1)?.message,
        lifecycle: report.summary.error?.lifecycle,
      });
    const getDiagnosisDocLink = (report) => {
      const matched = [
        report.errorMessage,
        report.errorStack,
        ...report.events.flatMap((event) => [
          event.errorMessage,
          event.errorStack,
          event.message,
        ]),
      ]
        .filter((item) => Boolean(item))
        .join('\n')
        .match(DIAGNOSTIC_DOC_LINK_PATTERN)?.[0];
      const docLink = sanitizeText(matched, 240);
      if (docLink) return docLink;
      return report.errorCode?.startsWith('RUNTIME-')
        ? RUNTIME_DOC_LINK
        : void 0;
    };
    const getDiagnosisTitle = (report) => {
      if (report.status !== 'error') {
        if (report.shared) {
          if (report.summary.sharedResolved)
            return 'Shared dependency resolved successfully';
          return 'Shared dependency loading is pending';
        }
        if (report.summary.componentLoaded) return 'Business component loaded';
        if (report.summary.runtimeLoaded) return 'Remote loaded successfully';
        if (report.summary.preloaded) return 'Remote preloaded successfully';
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
          if (resourceErrorType === 'network')
            return 'Remote entry failed because of a network error';
          if (resourceErrorType === 'timeout')
            return 'Remote entry request timed out';
          if (resourceErrorType === 'script-execution')
            return 'Remote entry loaded but failed during execution';
          return 'Remote entry resource could not be loaded';
        }
        default:
          if (report.failedPhase === 'shared' || report.shared)
            return 'Shared dependency could not be resolved';
          return report.failedPhase
            ? `Module Federation failed at ${report.failedPhase}`
            : 'Module Federation loading failed';
      }
    };
    const getCompletedPhases = (report) =>
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
    const getPendingPhases = (report) => {
      const started = /* @__PURE__ */ new Set();
      const ended = /* @__PURE__ */ new Set();
      report.events.forEach((event) => {
        if (event.status === 'start') {
          started.add(event.phase);
          return;
        }
        ended.add(event.phase);
      });
      return Array.from(started).filter((phase) => !ended.has(phase));
    };
    const createDiagnosisFacts = (report, ownerHint) => {
      const context = getReportContext(report);
      const facts = {};
      const addFact = (key, value) => {
        if (value === void 0 || value === null || value === '') return;
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
      addFact('requiredVersion', report.shared?.requiredVersion);
      addFact('selectedVersion', report.shared?.selectedVersion);
      addFact('availableVersions', report.shared?.availableVersions);
      addFact('provider', report.shared?.provider);
      addFact('sharedFrom', report.shared?.from);
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
    const createDiagnosisWarnings = (report) => {
      const warnings = [];
      if (report.status === 'error' && !report.errorCode)
        warnings.push('No known Module Federation error code was captured');
      if (report.summary.flags.fallback)
        warnings.push('Remote loading completed through fallback recovery');
      if (report.summary.runtimeLoaded && !report.summary.componentLoaded)
        warnings.push('Business component readiness signal was not recorded');
      if (report.moduleInfo && report.moduleInfo.matchedCount === 0)
        warnings.push(
          'No matching clipped moduleInfo entry was found for the failed remote',
        );
      return warnings;
    };
    const createDiagnosisActions = (report, ownerHint) => {
      const actions = [];
      const pushAction = (id, title, hint = ownerHint, detail) => {
        actions.push({
          id,
          ownerHint: hint,
          title,
          detail,
        });
      };
      if (report.status !== 'error' && !report.summary.error) return actions;
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
          )
            pushAction(
              'check-eager-config',
              'Check eager configuration or add an async boundary before sync shared consumption',
              'shared',
            );
          break;
        case 'RUNTIME-008': {
          const resourceErrorType = getDiagnosisResourceErrorType(report);
          if (
            resourceErrorType === 'network' ||
            resourceErrorType === 'timeout'
          )
            pushAction(
              'check-network',
              'Check remoteEntry URL, CORS, status code, and timeout',
              'network',
            );
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
          if (report.failedPhase === 'manifest')
            pushAction(
              'check-manifest-url',
              'Check manifest loading and parsing',
              'host',
            );
          if (report.failedPhase === 'remoteEntry')
            pushAction(
              'check-remote-entry',
              'Check remoteEntry loading and initialization',
              'remote',
            );
          if (report.failedPhase === 'expose')
            pushAction(
              'check-expose',
              'Check that the requested expose exists in the remote',
              'remote',
            );
          if (report.failedPhase === 'shared') {
            pushAction(
              'check-shared-provider',
              'Check shared dependency resolution',
              'shared',
            );
            if (
              report.shared?.requiredVersion !== void 0 ||
              report.shared?.availableVersions?.length ||
              report.shared?.reason === 'version-mismatch'
            )
              pushAction(
                'check-shared-version',
                'Compare requested shared version with available versions',
                'shared',
              );
            if (
              report.summary.error?.lifecycle === 'loadShareSync' ||
              report.shared?.reason === 'sync-async-boundary' ||
              report.shared?.eager === false
            )
              pushAction(
                'check-eager-config',
                'Check eager configuration or add an async boundary before sync shared consumption',
                'shared',
              );
          }
      }
      if (
        report.moduleInfo &&
        !actions.some((action) => action.id === 'check-module-info')
      )
        pushAction(
          'check-module-info',
          'Check deployment-provided __FEDERATION__.moduleInfo for the requested remote',
          'host',
        );
      if (!actions.length)
        pushAction(
          'inspect-runtime-events',
          'Inspect the ordered observability events for the failed phase',
          ownerHint,
        );
      return actions;
    };
    const createFactReport = (report) => {
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
        warnings: warnings.length ? warnings : void 0,
        actions: createDiagnosisActions(report, ownerHint),
      };
    };
    const refreshReportDerivedFields = (report) => {
      report.summary = createReportSummary(report);
      refreshModuleInfoSummary(report);
      report.diagnosis = createFactReport(report);
    };
    const updateReport = (event) => {
      let report = reports.get(event.traceId);
      if (!report) {
        report = {
          traceId: event.traceId,
          status: event.status === 'error' ? 'error' : 'pending',
          requestId: event.requestId,
          requestAlias: event.requestAlias,
          hostName: event.hostName,
          runtimeVersion: event.runtimeVersion,
          remote: event.remote ? { ...event.remote } : void 0,
          shared: event.shared ? copyEvent(event).shared : void 0,
          expose: event.expose,
          sanitizedUrl: event.sanitizedUrl,
          startedAt: event.timestamp,
          updatedAt: event.timestamp,
          duration: 0,
          failedPhase: event.status === 'error' ? event.phase : void 0,
          errorCode: event.errorCode,
          errorName: event.errorName,
          errorMessage: event.errorMessage,
          errorStack: event.errorStack,
          ownerHint: event.ownerHint,
          retryable: event.retryable,
          errorContext: event.errorContext ? { ...event.errorContext } : void 0,
          loadedBefore: copyLoadedBeforeInfo(event.loadedBefore),
          events: [],
          summary: {
            eventCount: 0,
            recovered: false,
            loadCompleted: false,
            runtimeLoaded: false,
            sharedResolved: false,
            preloaded: false,
            componentLoaded: false,
            outcome: 'pending',
            lastPhase: void 0,
            phases: {},
            shared: void 0,
            flags: createEmptyPhaseCollection().flags,
            error: void 0,
          },
        };
        reports.set(event.traceId, report);
      }
      if (event.requestId) report.requestId = event.requestId;
      if (event.requestAlias) report.requestAlias = event.requestAlias;
      if (event.hostName) report.hostName = event.hostName;
      if (event.runtimeVersion) report.runtimeVersion = event.runtimeVersion;
      if (event.remote) report.remote = { ...event.remote };
      if (event.shared) report.shared = copyEvent(event).shared;
      if (event.expose) report.expose = event.expose;
      if (event.sanitizedUrl) report.sanitizedUrl = event.sanitizedUrl;
      if (event.errorStack) report.errorStack = event.errorStack;
      if (event.errorCode) report.errorCode = event.errorCode;
      if (event.errorName) report.errorName = event.errorName;
      if (event.errorMessage) report.errorMessage = event.errorMessage;
      if (event.ownerHint) report.ownerHint = event.ownerHint;
      if (event.retryable !== void 0) report.retryable = event.retryable;
      if (event.errorContext) report.errorContext = { ...event.errorContext };
      if (event.loadedBefore)
        report.loadedBefore = copyLoadedBeforeInfo(event.loadedBefore);
      report.events.push(event);
      report.updatedAt = event.timestamp;
      report.duration = Math.max(0, report.updatedAt - report.startedAt);
      const eventOutcome = getEventOutcome(event);
      if (eventOutcome === 'error') {
        report.status = 'error';
        if (shouldReplaceFailedPhase(report, event))
          report.failedPhase = event.phase;
      } else if (eventOutcome === 'recovered') report.status = 'success';
      else if (eventOutcome === 'success' && report.status !== 'error')
        report.status = 'success';
      refreshReportDerivedFields(report);
      latestTraceId = event.traceId;
      trimEvents(report);
      return report;
    };
    const notifyEvent = (event, report, origin) => {
      try {
        options.onEvent?.(copyEvent(event), copyReport(report), { origin });
      } catch {}
    };
    const notifyReport = (report, origin) => {
      if (report.events[report.events.length - 1]?.status === 'start') return;
      try {
        options.onReport?.(copyReport(report), { origin });
      } catch {}
    };
    const notifyRawError = (errorValue, event, report, origin) => {
      if (!errorValue || !options.onRawError) return;
      try {
        options.onRawError(errorValue, {
          origin,
          event: copyEvent(event),
          report: copyReport(report),
        });
      } catch {}
    };
    const notifyCollector = (event, report) => {
      if (!collectorOptions) return;
      const fetcher = globalThis.fetch;
      if (typeof fetcher !== 'function') return;
      try {
        const body = JSON.stringify({
          schemaVersion: 1,
          source: 'browser',
          kind: 'event',
          createdAt: Date.now(),
          event: copyEvent(event),
          report: copyReport(report),
        });
        fetcher(getCollectorUrl(collectorOptions.port), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
          keepalive: body.length <= 64 * 1024,
          credentials: 'omit',
          mode: 'cors',
        }).catch((error) => {
          logger.debug(
            'Failed to notify local observability collector.',
            error,
          );
        });
      } catch (error) {
        logger.debug('Failed to notify local observability collector.', error);
      }
    };
    const notifyDevtools = (event, report) => {
      if (!devtoolsOptions) return;
      const poster = globalThis.postMessage;
      if (typeof poster !== 'function') return;
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
      } catch {}
    };
    const getEventsSnapshot = () => events.map(copyEvent);
    const getTraceIdsSnapshot = () => Array.from(reports.keys());
    const getReportTimeline = () =>
      Array.from(reports.values()).sort((left, right) => {
        if (right.updatedAt !== left.updatedAt)
          return right.updatedAt - left.updatedAt;
        return right.startedAt - left.startedAt;
      });
    const matchesReportValue = (value, expected) => {
      if (!value || !expected) return false;
      const normalizedValue = value.toLowerCase();
      const normalizedExpected = expected.toLowerCase();
      return (
        normalizedValue === normalizedExpected ||
        normalizedValue.includes(normalizedExpected)
      );
    };
    const matchesReportQuery = (report, query) => {
      if (query.traceId && report.traceId !== query.traceId) return false;
      if (query.status && report.status !== query.status) return false;
      if (query.outcome && report.summary.outcome !== query.outcome)
        return false;
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
      )
        return false;
      if (
        query.expose &&
        ![report.expose, report.requestId].some((value) =>
          matchesReportValue(value, query.expose),
        )
      )
        return false;
      if (
        query.shared &&
        ![report.shared?.name].some((value) =>
          matchesReportValue(value, query.shared),
        )
      )
        return false;
      return true;
    };
    const getReportsSnapshot = (options = {}) => {
      const limit = normalizeQueryLimit(options.limit);
      const timeline = getReportTimeline();
      return (limit ? timeline.slice(0, limit) : timeline).map(copyReport);
    };
    const findReportsSnapshot = (query = {}) => {
      const limit = normalizeQueryLimit(query.limit);
      const matchedReports = getReportTimeline().filter((report) =>
        matchesReportQuery(report, query),
      );
      return (limit ? matchedReports.slice(0, limit) : matchedReports).map(
        copyReport,
      );
    };
    const getLatestReportSnapshot = () => {
      if (!latestTraceId) return;
      const report = reports.get(latestTraceId);
      return report ? copyReport(report) : void 0;
    };
    const getReportSnapshot = (traceId) => {
      const report = reports.get(traceId);
      return report ? copyReport(report) : void 0;
    };
    const exportReportSnapshot = (traceId) =>
      traceId ? getReportSnapshot(traceId) : getLatestReportSnapshot();
    const createBrowserReader = () => ({
      getEvents: getEventsSnapshot,
      getTraceIds: getTraceIdsSnapshot,
      getReports: getReportsSnapshot,
      findReports: findReportsSnapshot,
      getLatestReport: getLatestReportSnapshot,
      getReport: getReportSnapshot,
      exportReport: exportReportSnapshot,
    });
    const shouldExposeBrowserGlobal = () => options.browser?.enabled === true;
    const ensureBrowserGlobal = (origin) => {
      if (!shouldExposeBrowserGlobal()) return;
      const federationGlobal = getFederationGlobal();
      if (!federationGlobal) return;
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
      if (shouldUseMinimalBrowserConsole()) return false;
      if (shouldForceDevelopmentChannels) return true;
      if (typeof process === 'undefined' || !process.env) return true;
      return process.env.NODE_ENV !== 'production';
    };
    const shouldNotifyCollector = () =>
      shouldUseDevelopmentChannels() &&
      (0, _module_federation_sdk.isDebugMode)();
    const shouldNotifyDevtools = () => shouldUseDevelopmentChannels();
    const shouldUseMinimalBrowserConsole = () =>
      options.browser?.mode === 'production';
    const shouldUseStartTrace = () =>
      options.trace?.printStart ??
      (options.browser?.enabled === true && !shouldUseMinimalBrowserConsole());
    const shouldPrintStartConsole = (event) =>
      shouldUseStartTrace() &&
      event.status === 'start' &&
      (event.phase === 'loadRemote' || event.phase === 'shared') &&
      shouldUseConsole();
    const shouldRecordStartTrace = (input) =>
      shouldUseStartTrace() &&
      input.status === 'start' &&
      (input.phase === 'loadRemote' || input.phase === 'shared');
    const shouldCollectLoadedBefore = (error) =>
      Boolean(error) ||
      (level === 'verbose' && !shouldUseMinimalBrowserConsole());
    const getBrowserReadCommand = (traceId) => {
      if (!browserGlobalScope) return;
      return `window.__FEDERATION__.__OBSERVABILITY__[${JSON.stringify(browserGlobalScope)}].getReport(${JSON.stringify(traceId)})`;
    };
    const emitConsoleHint = (event, report, rawError) => {
      if (
        getEventOutcome(event) !== 'error' ||
        !shouldUseConsole() ||
        consoleReportedTraceIds.has(report.traceId)
      )
        return;
      consoleReportedTraceIds.add(report.traceId);
      if (shouldUseMinimalBrowserConsole()) {
        const lines = [
          '[Module Federation] Observability report generated',
          `traceId: ${report.traceId}`,
        ];
        if (report.errorCode) lines.push(`errorCode: ${report.errorCode}`);
        try {
          console.error(lines.join('\n'));
        } catch {}
        return;
      }
      const lines = [
        '[Module Federation] Observability report generated',
        `traceId: ${report.traceId}`,
        `phase: ${report.failedPhase || event.phase}`,
      ];
      if (report.requestId) lines.push(`requestId: ${report.requestId}`);
      if (report.requestAlias)
        lines.push(`requestAlias: ${report.requestAlias}`);
      if (report.errorCode) lines.push(`errorCode: ${report.errorCode}`);
      if (report.shared?.name) lines.push(`shared: ${report.shared.name}`);
      const browserReadCommand = getBrowserReadCommand(report.traceId);
      if (browserReadCommand) lines.push(`read: ${browserReadCommand}`);
      else lines.push('read: enable browser output or use onReport(report)');
      const rawStack = getRawStack(rawError);
      if (options.printRawStack === true && rawStack)
        lines.push('rawStack:', rawStack);
      try {
        console.error(lines.join('\n'));
      } catch {}
    };
    const emitStartConsoleHint = (event, report) => {
      if (!shouldPrintStartConsole(event)) return;
      const startKey = [
        event.traceId,
        event.phase,
        event.requestId || event.shared?.name || event.remote?.name || '',
        event.lifecycle || '',
      ].join('|');
      if (consoleReportedStartKeys.has(startKey)) return;
      consoleReportedStartKeys.add(startKey);
      const lines = [
        '[Module Federation] Observability trace started',
        `traceId: ${report.traceId}`,
        `phase: ${event.phase}`,
      ];
      if (event.requestId) lines.push(`requestId: ${event.requestId}`);
      if (event.requestAlias) lines.push(`requestAlias: ${event.requestAlias}`);
      if (event.remote?.name) lines.push(`remote: ${event.remote.name}`);
      if (event.shared?.name) lines.push(`shared: ${event.shared.name}`);
      if (event.lifecycle) lines.push(`lifecycle: ${event.lifecycle}`);
      const browserReadCommand = getBrowserReadCommand(report.traceId);
      if (browserReadCommand) lines.push(`read: ${browserReadCommand}`);
      else
        lines.push(
          'read: enable browser output or use getReports({ limit: 10 })',
        );
      try {
        console.info(lines.join('\n'));
      } catch {}
    };
    const prepareOutputChannels = (origin) => {
      browserGlobalScope = void 0;
      ensureBrowserGlobal(origin);
    };
    const prepareRuntimeOrigin = (origin) => {
      if (!isEnabled()) return false;
      lastRuntimeOrigin = origin;
      prepareOutputChannels(origin);
      return true;
    };
    const recordEvent = (input, origin) => {
      if (suppressRuntimeEvents) return;
      const event = normalizeEvent(input, resolveTraceId(input), origin);
      applyPhaseDuration(event);
      updateTraceMaps(event);
      if (!shouldRecordEvent(level, input) && !shouldRecordStartTrace(input))
        return;
      events.push(event);
      const report = updateReport(event);
      emitStartConsoleHint(event, report);
      emitConsoleHint(event, report, input.error);
      if (shouldNotifyCollector()) notifyCollector(event, report);
      if (shouldNotifyDevtools()) notifyDevtools(event, report);
      notifyRawError(input.error, event, report, origin);
      notifyEvent(event, report, origin);
      notifyReport(report, origin);
      return event;
    };
    const markComponentLoaded = (markOptions = {}) => {
      if (options.enabled === false || !runtimeObservabilityEnabled) return;
      return recordEvent(
        {
          traceId:
            markOptions.traceId ||
            (markOptions.requestId
              ? traceByRequest.get(
                  sanitizeRequestId(markOptions.requestId) || '',
                )
              : void 0) ||
            latestTraceId ||
            createTraceId({
              phase: 'component',
              status: 'success',
              requestId: markOptions.requestId,
            }),
          phase: 'component',
          status: 'success',
          requestId: markOptions.requestId,
          componentName: markOptions.componentName,
          metadata: markOptions.metadata,
          eventName: COMPONENT_BUSINESS_LOADED_EVENT,
          message: COMPONENT_BUSINESS_LOADED_EVENT,
          source: 'business',
        },
        lastRuntimeOrigin,
      );
    };
    const getReactForOrigin = async (origin) => {
      const previousSuppressRuntimeEvents = suppressRuntimeEvents;
      suppressRuntimeEvents = true;
      try {
        let reactFactory;
        try {
          reactFactory = origin.loadShareSync?.('react');
        } catch {
          reactFactory = void 0;
        }
        if (typeof reactFactory !== 'function')
          reactFactory = await origin.loadShare?.('react');
        if (typeof reactFactory !== 'function') return;
        return resolveReactLike(reactFactory());
      } catch {
        return;
      } finally {
        suppressRuntimeEvents = previousSuppressRuntimeEvents;
      }
    };
    const getReactWrapPolicy = (loadArgs) => {
      if (
        options.react?.enabled === false ||
        options.react?.injectLoadedCallback !== true
      )
        return;
      const remoteIds = options.react.remoteIds || [];
      if (!remoteIds.length) return { allowAnonymousComponent: false };
      const normalizeRemoteId = (value) =>
        value.replace(/\/\.\//g, '/').replace(/^\.\//, '');
      const expectedRemoteIds = new Set(remoteIds.map(normalizeRemoteId));
      const candidates = /* @__PURE__ */ new Set();
      const addCandidate = (value) => {
        if (!value) return;
        candidates.add(value);
        candidates.add(normalizeRemoteId(value));
      };
      const exposeValues = [loadArgs.expose];
      if (loadArgs.expose?.startsWith('./'))
        exposeValues.push(loadArgs.expose.slice(2));
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
      return Array.from(candidates).some((candidate) =>
        expectedRemoteIds.has(candidate),
      )
        ? { allowAnonymousComponent: true }
        : void 0;
    };
    const createReactComponentWrapper = (
      component,
      loadArgs,
      wrapPolicy,
      react,
    ) => {
      const target = resolveReactComponentTarget(
        component,
        options.react?.defaultExportMode ||
          (wrapPolicy.allowAnonymousComponent ? 'component' : 'preserve'),
        wrapPolicy.allowAnonymousComponent,
      );
      if (!target) return;
      const componentName = getReactComponentName(
        target.component,
        loadArgs.expose || loadArgs.id,
      );
      const originalComponent = target.component;
      const ObservedRemoteComponent = (props) => {
        const incomingProps = isRecord(props) ? props : {};
        const originalLoadedCallback = getObjectValue(
          incomingProps,
          ON_MF_REMOTE_LOADED_PROP,
        );
        const onMFRemoteLoaded = (loadedOptions = {}) => {
          markComponentLoaded({
            requestId: loadArgs.id,
            componentName: loadedOptions.componentName || componentName,
            metadata: loadedOptions.metadata,
          });
          if (typeof originalLoadedCallback === 'function')
            originalLoadedCallback(loadedOptions);
        };
        const nextProps = {
          ...incomingProps,
          [ON_MF_REMOTE_LOADED_PROP]: onMFRemoteLoaded,
        };
        if (react) return react.createElement(originalComponent, nextProps);
        return originalComponent(nextProps);
      };
      ObservedRemoteComponent.displayName = `ObservedRemote(${componentName})`;
      copyComponentStatics(ObservedRemoteComponent, originalComponent);
      return target.createResult(ObservedRemoteComponent);
    };
    const wrapReactComponent = async (component, loadArgs) => {
      const wrapPolicy = getReactWrapPolicy(loadArgs);
      if (!wrapPolicy) return;
      return createReactComponentWrapper(
        component,
        loadArgs,
        wrapPolicy,
        await getReactForOrigin(loadArgs.origin),
      );
    };
    const wrapReactComponentFactory = async (factory, loadArgs) => {
      const wrapPolicy = getReactWrapPolicy(loadArgs);
      if (!wrapPolicy || typeof factory !== 'function') return;
      const react = await getReactForOrigin(loadArgs.origin);
      const originalFactory = factory;
      return (...factoryArgs) => {
        const moduleOrPromise = originalFactory(...factoryArgs);
        if (moduleOrPromise && typeof moduleOrPromise.then === 'function')
          return moduleOrPromise.then((module) => {
            return (
              createReactComponentWrapper(
                module,
                loadArgs,
                wrapPolicy,
                react,
              ) || module
            );
          });
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
    const plugin = {
      name: pluginName,
      apply(instance) {
        appliedRuntimeVersion =
          sanitizeText(instance.version, 80) || appliedRuntimeVersion;
        if (shouldAttachInstanceApi)
          instance.markComponentLoaded = markComponentLoaded;
      },
      beforeRequest(args) {
        const requestArgs = args;
        if (!prepareRuntimeOrigin(requestArgs.origin))
          return returnHookArgs(args);
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
        const matchArgs = args;
        if (!prepareRuntimeOrigin(matchArgs.origin)) return;
        const remote = createRemoteInfo(
          matchArgs.remoteInfo || matchArgs.remote,
        );
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
            errorContext: hostRemotes ? { hostRemotes } : void 0,
          },
          matchArgs.origin,
        );
      },
      beforeLoadRemoteSnapshot(args) {
        prepareRuntimeOrigin(args.origin);
      },
      loadSnapshot(args) {
        if (!isEnabled()) return returnHookArgs(args);
        const snapshotArgs = args;
        const moduleRemote = createRemoteInfo(snapshotArgs.moduleInfo);
        const snapshotRemoteEntry =
          snapshotArgs.remoteSnapshot?.remoteEntry ||
          snapshotArgs.remoteSnapshot?.entry;
        const manifestUrl = isManifestUrl(moduleRemote?.entry)
          ? moduleRemote?.entry
          : isManifestUrl(snapshotRemoteEntry)
            ? snapshotRemoteEntry
            : void 0;
        if (!manifestUrl) return returnHookArgs(args);
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
        if (loadingManifestUrls.has(manifestUrl)) return returnHookArgs(args);
        loadingManifestUrls.add(manifestUrl);
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
        if (options.enabled === false) return returnHookArgs(args);
        const snapshotArgs = args;
        if (snapshotArgs.from !== 'manifest') return returnHookArgs(args);
        const manifestUrl =
          sanitizeUrl(snapshotArgs.manifestUrl) ||
          sanitizeUrl(snapshotArgs.moduleInfo?.entry);
        recordEvent(
          {
            phase: 'manifest',
            status: 'success',
            requestId: manifestUrl,
            remote: createRemoteInfo({
              ...snapshotArgs.moduleInfo,
              entry: manifestUrl || snapshotArgs.moduleInfo?.entry,
            }),
            url: manifestUrl,
            lifecycle: 'loadRemoteSnapshot',
            message: 'manifest:resolved',
            cached: Boolean(manifestUrl && seenManifestUrls.has(manifestUrl)),
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
        const resolveArgs = args;
        if (!prepareRuntimeOrigin(resolveArgs.origin))
          return returnHookArgs(args);
        if (
          !isManifestUrl(
            createRemoteInfo(resolveArgs.remoteInfo || resolveArgs.remote)
              ?.entry,
          )
        )
          return returnHookArgs(args);
        return returnHookArgs(args);
      },
      async onLoad(args) {
        const loadArgs = args;
        if (!prepareRuntimeOrigin(loadArgs.origin)) return;
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
              ? collectLoadedBeforeInfo(
                  remote,
                  loadArgs.expose,
                  loadArgs.origin,
                )
              : void 0,
          },
          loadArgs.origin,
        );
        if (wrappedComponent) return wrappedComponent;
      },
      errorLoadRemote(args) {
        const errorArgs = args;
        if (
          !prepareRuntimeOrigin(errorArgs.origin) ||
          (errorArgs.lifecycle !== 'onLoad' &&
            errorArgs.lifecycle !== 'beforeRequest' &&
            errorArgs.lifecycle !== 'afterResolve')
        )
          return;
        const isManifestError = errorArgs.lifecycle === 'afterResolve';
        if (isManifestError && errorArgs.id)
          loadingManifestUrls.delete(errorArgs.id);
        const remote = createRemoteInfo(errorArgs.remote);
        recordEvent(
          {
            phase: isManifestError ? 'manifest' : 'loadRemote',
            status: 'error',
            requestId: errorArgs.id,
            lifecycle: errorArgs.lifecycle,
            expose: errorArgs.expose,
            remote,
            url: isManifestError ? errorArgs.id : void 0,
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
      },
      afterLoadRemote(args) {
        const loadArgs = args;
        if (!prepareRuntimeOrigin(loadArgs.origin)) return;
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
              ? collectLoadedBeforeInfo(
                  remote,
                  loadArgs.expose,
                  loadArgs.origin,
                )
              : void 0,
          },
          loadArgs.origin,
        );
      },
      loadEntry(args) {
        const entryArgs = args;
        if (
          shouldSkipRuntimeHook(entryArgs.origin) ||
          !prepareRuntimeOrigin(entryArgs.origin)
        )
          return;
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
        const entryArgs = args;
        if (
          shouldSkipRuntimeHook(entryArgs.origin) ||
          !prepareRuntimeOrigin(entryArgs.origin)
        )
          return;
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
        if (!entryArgs.error && remoteEntryKey)
          seenRemoteEntryKeys.add(remoteEntryKey);
      },
      beforeInitRemote(args) {
        const initArgs = args;
        if (
          shouldSkipRuntimeHook(initArgs.origin) ||
          !prepareRuntimeOrigin(initArgs.origin)
        )
          return;
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
        const initArgs = args;
        if (
          shouldSkipRuntimeHook(initArgs.origin) ||
          !prepareRuntimeOrigin(initArgs.origin)
        )
          return;
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
        const exposeArgs = args;
        if (
          shouldSkipRuntimeHook(exposeArgs.origin) ||
          !prepareRuntimeOrigin(exposeArgs.origin)
        )
          return;
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
        const exposeArgs = args;
        if (
          shouldSkipRuntimeHook(exposeArgs.origin) ||
          !prepareRuntimeOrigin(exposeArgs.origin)
        )
          return;
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
              : void 0,
          },
          exposeArgs.origin,
        );
      },
      beforeExecuteFactory(args) {
        const factoryArgs = args;
        if (
          shouldSkipRuntimeHook(factoryArgs.origin) ||
          !prepareRuntimeOrigin(factoryArgs.origin)
        )
          return;
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
        const factoryArgs = args;
        if (
          shouldSkipRuntimeHook(factoryArgs.origin) ||
          !prepareRuntimeOrigin(factoryArgs.origin)
        )
          return;
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
              : void 0,
          },
          factoryArgs.origin,
        );
      },
      beforeLoadShare(args) {
        if (
          shouldGuardSharedHooksByRuntimeVersion &&
          !supportsRuntimeHookObservability(args.origin)
        )
          return returnHookArgs(args);
        if (!prepareRuntimeOrigin(args.origin)) return returnHookArgs(args);
        recordEvent(
          {
            phase: 'shared',
            status: 'start',
            requestId: `shared:${args.pkgName}`,
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
        )
          return returnHookArgs(args);
        if (!prepareRuntimeOrigin(args.origin)) return returnHookArgs(args);
        recordEvent(
          {
            phase: 'shared',
            status: 'success',
            requestId: `shared:${args.pkgName}`,
            lifecycle: args.lifecycle,
            shared: createSharedInfo(args),
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
        )
          return returnHookArgs(args);
        if (!prepareRuntimeOrigin(args.origin)) return returnHookArgs(args);
        const handledCustomShareMiss = args.recovered === true && !args.error;
        const reason = handledCustomShareMiss
          ? 'custom-share-info-unmatched'
          : getSharedErrorReason(args);
        recordEvent(
          {
            phase: 'shared',
            status: handledCustomShareMiss ? 'complete' : 'error',
            requestId: `shared:${args.pkgName}`,
            lifecycle: args.lifecycle,
            shared: createSharedInfo(args, reason),
            message: reason ? `shared:${reason}` : void 0,
            error: handledCustomShareMiss ? void 0 : args.error,
            recovered: args.recovered,
          },
          args.origin,
        );
        return returnHookArgs(args);
      },
    };
    if (!shouldDisablePreloadHooks) {
      plugin.generatePreloadAssets = (args) => {
        const preloadArgs = args;
        if (!prepareRuntimeOrigin(preloadArgs.origin))
          return returnHookArgs(args);
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
        return returnHookArgs(args);
      };
      plugin.afterPreloadRemote = (args) => {
        const preloadArgs = args;
        if (!prepareRuntimeOrigin(preloadArgs.origin))
          return returnHookArgs(args);
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
          return returnHookArgs(args);
        }
        results.forEach((preloadResult) => {
          const remote = createRemoteInfo(
            preloadResult.remoteInfo || preloadResult.remote,
          );
          const requestId =
            sanitizeRequestId(preloadResult.id) ||
            remote?.name ||
            sanitizeText(preloadResult.preloadConfig?.nameOrAlias, 160);
          preloadResult.results?.forEach((assetResult) => {
            const isError =
              assetResult.status === 'error' ||
              assetResult.status === 'timeout';
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
                error: isError ? assetResult.error : void 0,
                errorContext: isError
                  ? {
                      resourceType: assetResult.resourceType,
                      initiator: assetResult.initiator,
                      status: assetResult.status,
                      id: assetResult.id,
                    }
                  : void 0,
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
        return returnHookArgs(args);
      };
    }
    return {
      plugin,
      getEvents() {
        return getEventsSnapshot();
      },
      getTraceIds() {
        return getTraceIdsSnapshot();
      },
      getReports(options) {
        return getReportsSnapshot(options);
      },
      findReports(query) {
        return findReportsSnapshot(query);
      },
      getLatestReport() {
        return getLatestReportSnapshot();
      },
      getReport(traceId) {
        return getReportSnapshot(traceId);
      },
      exportReport(traceId) {
        return exportReportSnapshot(traceId);
      },
      clear() {
        events.length = 0;
        reports.clear();
        traceByRequest.clear();
        traceByRemote.clear();
        phaseStartTimes.clear();
        seenManifestUrls.clear();
        seenRemoteEntryKeys.clear();
        consoleReportedTraceIds.clear();
        consoleReportedStartKeys.clear();
        latestTraceId = void 0;
        runtimeObservabilityEnabled = false;
        effectiveMaxEvents = configuredMaxEvents;
        browserGlobalScope = void 0;
        lastRuntimeOrigin = void 0;
      },
      markComponentLoaded,
    };
  }

  //#endregion
  Object.defineProperty(exports, 'createObservability', {
    enumerable: true,
    get: function () {
      return createObservability;
    },
  });
  function ChromeObservabilityPlugin(options = {}) {
    return exports.createObservability(options, {
      pluginName: 'observability-plugin:chrome-extension',
      fixedBrowserScope: 'chrome_extension',
      attachInstanceApi: false,
      guardSharedHooksByRuntimeVersion: true,
      guardRuntimeHooksByRuntimeVersion: true,
      disablePreloadHooks: true,
      returnHookArgs: true,
      forceDevelopmentChannels: true,
    }).plugin;
  }

  global.ChromeObservabilityPlugin = ChromeObservabilityPlugin;
  global.ModuleFederationChromeObservabilityPlugin = {
    ChromeObservabilityPlugin: ChromeObservabilityPlugin,
    default: ChromeObservabilityPlugin,
  };
})(typeof window !== 'undefined' ? window : globalThis);
