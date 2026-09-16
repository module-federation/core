import { LIMITS } from './constants';
import type { ModuleFederationSnapshot } from './types';

/** Read data properties only: diagnostics must not execute runtime getters. */
function get(value: unknown, key: PropertyKey): unknown {
  if (!value || typeof value !== 'object') return undefined;
  try {
    return Object.getOwnPropertyDescriptor(value, key)?.value;
  } catch {
    return undefined;
  }
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const absolute = /^(https?:)?\/\//i.test(value);
    const parsed = new URL(value, 'https://mf.invalid/');
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    parsed.username = '';
    parsed.password = '';
    parsed.search = '';
    parsed.hash = '';
    return (absolute ? parsed.href : value.split(/[?#]/, 1)[0]).slice(
      0,
      LIMITS.text,
    );
  } catch {
    return null;
  }
}
function sanitizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  // Snapshot keys and versions can themselves contain manifest URLs.
  return value
    .replace(
      /(?:https?:)?\/\/[^\s]+/gi,
      (match) => sanitizeUrl(match) || '[url]',
    )
    .split(/[?#]/, 1)[0]
    .slice(0, LIMITS.text);
}
function flag(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

/**
 * Late reader of MF-owned Federation.__INSTANCES__, ModuleFederation.options,
 * shareScopeMap, moduleCache (Module.inited/remoteInfo), and SDK GlobalModuleInfo.
 * Does not import runtime-core: its global module initializes federation state.
 * Identity is stable for this reader's lifetime, including duplicate names.
 */
export function createModuleFederationReader(
  readGlobal: () => unknown = () => globalThis,
): () => ModuleFederationSnapshot {
  const ids = new WeakMap<object, string>();
  let sequence = 0;
  return () => {
    const federation = get(readGlobal(), '__FEDERATION__');
    const result: ModuleFederationSnapshot = {
      schemaVersion: 1,
      boundary: 'current-state',
      present: record(federation),
      truncated: false,
      moduleInfoAvailable: record(get(federation, 'moduleInfo')),
      instances: [],
      remotes: [],
      shared: [],
      moduleInfo: [],
    };
    const bounded = (
      value: unknown,
      sanitize: (value: unknown) => string | null,
    ) => {
      if (typeof value === 'string' && value.length > LIMITS.text)
        result.truncated = true;
      return sanitize(value);
    };
    const text = (value: unknown) => bounded(value, sanitizeText);
    const url = (value: unknown) => bounded(value, sanitizeUrl);
    // Bound traversal too, including deeply populated or empty scope maps.
    let visits = 4096;
    const entries = (
      value: unknown,
      limit: number = LIMITS.entries,
    ): [string, unknown][] => {
      const output: [string, unknown][] = [];
      if (!record(value) && !Array.isArray(value)) return output;
      try {
        for (const key in value) {
          if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
          if (output.length >= limit || visits-- <= 0) {
            result.truncated = true;
            break;
          }
          output.push([key, get(value, key)]);
        }
      } catch {
        result.truncated = true;
      }
      return output;
    };
    const rawInstances = get(federation, '__INSTANCES__');
    const instances = (
      Array.isArray(rawInstances) ? entries(rawInstances, LIMITS.instances) : []
    )
      .map(([, value]) => value)
      .filter(record);
    for (const instance of instances) {
      if (!ids.has(instance)) ids.set(instance, `instance-${++sequence}`);
    }
    for (const instance of instances) {
      const instanceId = ids.get(instance)!;
      const options = get(instance, 'options');
      const rawRemotes = get(options, 'remotes');
      const scopes = get(instance, 'shareScopeMap');
      const cache = get(instance, 'moduleCache');
      const hasCache = cache instanceof Map;
      result.instances.push({
        instanceId,
        name: text(get(options, 'name') ?? get(instance, 'name')),
        runtimeVersion: text(get(instance, 'version')),
        version: text(get(options, 'version')),
        role:
          Array.isArray(rawRemotes) && rawRemotes.length > 0
            ? 'consumer'
            : 'unknown',
        capabilities: {
          remotes: Array.isArray(rawRemotes),
          shared: record(scopes),
          remoteLoaded: hasCache,
        },
      });
      for (const [, remote] of entries(
        rawRemotes,
        LIMITS.entries - result.remotes.length,
      )) {
        const name = get(remote, 'name');
        const module = hasCache
          ? Map.prototype.get.call(cache, name)
          : undefined;
        const producer = get(module, 'remoteInfo');
        const inited = get(module, 'inited');
        result.remotes.push({
          instanceId,
          name: text(name),
          alias: text(get(remote, 'alias')),
          version: text(get(remote, 'version')),
          entry: url(get(remote, 'entry')),
          // Absence from moduleCache does NOT prove that a remote never loaded.
          loaded:
            inited === true
              ? 'loaded'
              : inited === false
                ? 'not-initialized'
                : 'unknown',
          producer: record(producer)
            ? {
                name: text(get(producer, 'name')),
                version: text(get(producer, 'version')),
                entry: url(get(producer, 'entry')),
              }
            : null,
          // Name/version matching suggests candidates; it does not establish ownership.
          candidateInstanceIds: instances
            .filter((candidate) => {
              const candidateOptions = get(candidate, 'options');
              return (
                candidate !== instance &&
                typeof name === 'string' &&
                get(candidateOptions, 'name') === name &&
                (get(remote, 'version') === undefined ||
                  get(candidateOptions, 'version') === get(remote, 'version'))
              );
            })
            .map((candidate) => ids.get(candidate)!),
        });
      }
      for (const [scope, packages] of entries(scopes)) {
        for (const [name, versions] of entries(packages)) {
          for (const [version, shared] of entries(
            versions,
            LIMITS.entries - result.shared.length,
          )) {
            const config = get(shared, 'shareConfig');
            result.shared.push({
              instanceId,
              scope: text(scope)!,
              name: text(name)!,
              version: text(version)!,
              provider: text(get(shared, 'from')),
              loaded: flag(get(shared, 'loaded')),
              singleton: flag(get(config, 'singleton')),
              eager: flag(get(config, 'eager') ?? get(shared, 'eager')),
              requiredVersion:
                get(config, 'requiredVersion') === false
                  ? false
                  : text(get(config, 'requiredVersion')),
              strategy: text(
                get(shared, 'strategy') ?? get(options, 'shareStrategy'),
              ),
            });
          }
        }
      }
    }
    let moduleBudget = LIMITS.entries;
    for (const [key, info] of entries(get(federation, 'moduleInfo'))) {
      const modules = entries(get(info, 'modules'), moduleBudget).map(
        ([, module]) => ({
          name: text(get(module, 'moduleName')),
          path: url(get(module, 'modulePath')),
        }),
      );
      moduleBudget -= modules.length;
      result.moduleInfo.push({
        key: text(key)!,
        version: text(get(info, 'version')),
        buildVersion: text(get(info, 'buildVersion')),
        remoteEntry: url(get(info, 'remoteEntry')),
        remoteEntryType: text(get(info, 'remoteEntryType')),
        globalName: text(get(info, 'globalName')),
        publicPath: url(get(info, 'publicPath')),
        modules,
      });
    }
    return result;
  };
}
export type { ModuleFederationSnapshot } from './types';
