import { parseEntry } from '@module-federation/sdk';
import type {
  Normalized,
  NormalizedVersionInfo,
  ShareScopeMap,
  GlobalShareScopeMap,
  Shared,
} from './global';

function isPlainObject(v: object): v is Record<string, unknown> {
  return Object.prototype.toString.call(v) === '[object Object]';
}

function toName(x: unknown): string {
  if (x == null) {
    return 'unknown';
  }
  if (typeof x === 'string') {
    return x;
  }
  if (isPlainObject(x) && typeof x.name === 'string') {
    return x.name;
  }
  try {
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}

// 往 normalized 聚合一个 Shared
function add(
  normalized: Normalized,
  scope: string,
  share: string,
  version: string,
  shared: Shared,
  loaded: boolean,
  instance?: string,
) {
  if (!normalized[scope]) {
    normalized[scope] = {};
  }
  if (!normalized[scope][share]) {
    normalized[scope][share] = { versions: {} };
  }
  const vmap = normalized[scope][share].versions;
  if (!vmap[version]) {
    vmap[version] = [] as NormalizedVersionInfo[];
  }

  const versionInfo: NormalizedVersionInfo = {
    instance: instance || 'unknown',
    providers: [],
    consumers: [],
    loaded,
  };

  const providerName = shared?.from ? toName(shared.from) : null;
  if (providerName) {
    versionInfo.providers.push(providerName);
  }
  const consumers = Array.isArray(shared?.useIn)
    ? shared.useIn.map(toName)
    : [];
  for (const c of consumers) {
    if (c) {
      versionInfo.consumers.push(c);
    }
  }

  // 添加到版本数组
  vmap[version].push(versionInfo);
}

function normalizeInstance(
  input: ShareScopeMap,
  normalized: Normalized,
  instance?: string,
) {
  for (const [scope, scopeObj] of Object.entries(input || {})) {
    if (!isPlainObject(scopeObj)) {
      continue;
    }
    for (const [share, shareObj] of Object.entries(scopeObj || {})) {
      if (isPlainObject(shareObj)) {
        // shareObj 可能是 {version: Shared} 或直接 Shared（缺失版本层）
        const entries = Object.entries(shareObj);
        if (
          entries.length &&
          isPlainObject(entries[0][1]) &&
          ('from' in entries[0][1] || 'useIn' in entries[0][1])
        ) {
          // eslint-disable-next-line max-depth
          for (const [version, shared] of entries) {
            add(
              normalized,
              scope,
              share,
              version,
              shared,
              Boolean(shared.loaded),
              instance,
            );
          }
        } else if ('from' in shareObj || 'useIn' in shareObj) {
          // 缺失版本层，兜底 unknown
          add(
            normalized,
            scope,
            share,
            'unknown',
            shareObj as Shared,
            Boolean(shareObj.loaded),
            instance,
          );
        } else {
          // 不可识别，尝试兜底
          add(
            normalized,
            scope,
            share,
            'unknown',
            shareObj as Shared,
            Boolean(shareObj.loaded),
            instance,
          );
        }
      }
    }
  }
}

export function normalizeGlobalShare(
  input: Record<string, unknown>,
): Normalized {
  const normalized: Normalized = {};
  if (!isPlainObject(input)) {
    throw new Error('输入必须是对象格式');
  }

  // 验证是否为GlobalShareScopeMap格式
  if (!validateGlobalShareScopeMapFormat(input)) {
    throw new Error('数据格式不符合GlobalShareScopeMap规范，请检查数据结构');
  }

  try {
    for (const [instance, scopeMap] of Object.entries(
      input as GlobalShareScopeMap,
    )) {
      if (!isPlainObject(scopeMap)) {
        continue;
      }
      // compat legacy data
      if (instance === 'default') {
        continue;
      }
      normalizeInstance(scopeMap, normalized, parseEntry(instance).name);
    }
  } catch (e) {
    console.warn('normalizeGlobalShare 异常', e);
    throw new Error(
      `数据处理失败: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  return normalized;
}

function validateGlobalShareScopeMapFormat(
  input: Record<string, unknown>,
): boolean {
  if (!isPlainObject(input)) {
    return false;
  }

  // 检查是否至少有一个实例
  const instances = Object.keys(input);
  if (instances.length === 0) {
    return false;
  }

  // 检查每个实例是否包含scope结构
  for (const instance of instances) {
    const scopeMap = input[instance];
    if (!isPlainObject(scopeMap as Record<string, unknown>)) {
      continue;
    }

    const scopes = Object.keys(scopeMap as Record<string, unknown>);
    if (scopes.length === 0) {
      continue;
    }

    // 检查至少一个scope包含share结构
    for (const scope of scopes) {
      const shareMap = (scopeMap as Record<string, unknown>)[scope];
      if (!isPlainObject(shareMap as Record<string, unknown>)) {
        continue;
      }

      const shares = Object.keys(shareMap as Record<string, unknown>);
      if (shares.length > 0) {
        return true; // 找到有效的scope/share结构
      }
    }
  }

  return false;
}

export function validateNormalized(n: Normalized): boolean {
  try {
    const scopes = Object.keys(n || {});
    if (!scopes.length) {
      return false;
    }
    for (const s of scopes) {
      const shares = n[s] || {};
      const shareKeys = Object.keys(shares);
      if (!shareKeys.length) {
        continue;
      }
      for (const sh of shareKeys) {
        const vmap = shares[sh]?.versions || {};
        if (Object.keys(vmap).length) {
          return true; // 找到有效的scope/share/version结构
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function safeStringify(obj: NormalizedVersionInfo[], space = 2): string {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (k, v) => {
      if (typeof v === 'object' && v !== null) {
        if (seen.has(v)) {
          return '[Circular]';
        }
        seen.add(v);
      }
      return v;
    },
    space,
  );
}
