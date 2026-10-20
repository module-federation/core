import fs from 'node:fs';
import path from 'node:path';
import { findPackageJson } from './findPackageJson';

interface PkgInfo {
  dir: string;
  name?: string;
  main?: string;
  module?: string;
  exports?: Record<string, any> | string;
}

const pkgCache = new Map<string, PkgInfo | null>();

export function clearPackageJsonCache(): void {
  pkgCache.clear();
}

export function getPackageJsonInfo(startDir: string): PkgInfo | null {
  const pkgJsonPath = findPackageJson(startDir);
  if (!pkgJsonPath) {
    return null;
  }
  if (pkgCache.has(pkgJsonPath)) {
    return pkgCache.get(pkgJsonPath)!;
  }
  try {
    const raw = fs.readFileSync(pkgJsonPath, 'utf-8');
    const data = JSON.parse(raw);
    const info: PkgInfo = {
      dir: path.dirname(pkgJsonPath),
      name: data.name,
      main: data.main,
      module: data.module,
      exports: data.exports,
    };
    pkgCache.set(pkgJsonPath, info);
    return info;
  } catch {
    pkgCache.set(pkgJsonPath, null);
    return null;
  }
}

export class SharedKeysSet extends Set<string> {
  prefixes: string[] = [];

  isMatch(candidate: string): boolean {
    if (this.has(candidate)) {
      return true;
    }
    for (const prefix of this.prefixes) {
      if (candidate.startsWith(prefix) || candidate === prefix.slice(0, -1)) {
        return true;
      }
    }
    return false;
  }
}

export function isSharedKeyMatch(
  candidate: string,
  sharedKeys: SharedKeysSet | Set<string>,
): boolean {
  if (sharedKeys instanceof SharedKeysSet) {
    return sharedKeys.isMatch(candidate);
  }
  if (sharedKeys.has(candidate)) {
    return true;
  }
  for (const key of sharedKeys) {
    if (
      key.endsWith('/') &&
      (candidate.startsWith(key) || candidate === key.slice(0, -1))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts all unique shared package/module keys from the user's `shared` configuration,
 * including configured `request` overrides and trailing-slash prefixes.
 */
export function extractSharedKeys(shared: unknown): SharedKeysSet {
  const result = new SharedKeysSet();

  const addKey = (k: string) => {
    if (!k || typeof k !== 'string') return;
    result.add(k);
    if (k.endsWith('/') && !result.prefixes.includes(k)) {
      result.prefixes.push(k);
    }
  };

  const processEntry = (key: string, val: unknown) => {
    addKey(key);
    if (val && typeof val === 'object') {
      const req = (val as { request?: unknown }).request;
      if (typeof req === 'string') {
        addKey(req);
      }
    }
  };

  if (Array.isArray(shared)) {
    for (const item of shared) {
      if (typeof item === 'string') {
        addKey(item);
      } else if (item && typeof item === 'object') {
        for (const [k, val] of Object.entries(item)) {
          processEntry(k, val);
        }
      }
    }
  } else if (shared && typeof shared === 'object') {
    for (const [k, val] of Object.entries(shared as Record<string, unknown>)) {
      processEntry(k, val);
    }
  }

  // Sort prefixes descending by length so more specific prefixes match first
  result.prefixes.sort((a, b) => b.length - a.length);

  return result;
}

const STRIP_EXT_REGEX = /\.[^/.]+$/;
const STRIP_SRC_PREFIX_REGEX = /^(src|lib)\//;

/**
 * Resolves a relative import request (e.g. `./FeatureTypeContext` or `../context-lib/FeatureTypeContext`)
 * to its canonical shared package specifier (e.g. `@repro/context-lib/FeatureTypeContext`)
 * if the resolved target matches any key in `sharedKeys`.
 */
export function resolveCanonicalShareKey(
  context: string,
  request: string,
  sharedKeys: SharedKeysSet | Set<string>,
): string | null {
  if (!request || !request.startsWith('.') || !sharedKeys.size) {
    return null;
  }

  const targetPath = path.resolve(context, request);

  // Determine starting directory to look up package.json
  let startDir = targetPath;
  try {
    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isDirectory()) {
      startDir = path.dirname(targetPath);
    }
  } catch {
    startDir = path.dirname(targetPath);
  }

  const pkg = getPackageJsonInfo(startDir);
  if (!pkg || !pkg.name) {
    return null;
  }

  const pkgName = pkg.name;
  const rel = path.relative(pkg.dir, targetPath).replace(/\\/g, '/');
  const relNoExt = rel.replace(STRIP_EXT_REGEX, '');
  const relNoPrefix = relNoExt.replace(STRIP_SRC_PREFIX_REGEX, '');

  const candidates = new Set<string>();

  // 1. Root / main package match
  if (isSharedKeyMatch(pkgName, sharedKeys)) {
    if (
      rel === '' ||
      rel === 'index' ||
      relNoExt === 'index' ||
      relNoPrefix === 'index' ||
      (pkg.main &&
        path.resolve(pkg.dir, pkg.main).replace(STRIP_EXT_REGEX, '') ===
          targetPath.replace(STRIP_EXT_REGEX, '')) ||
      (pkg.module &&
        path.resolve(pkg.dir, pkg.module).replace(STRIP_EXT_REGEX, '') ===
          targetPath.replace(STRIP_EXT_REGEX, ''))
    ) {
      candidates.add(pkgName);
    }
  }

  // 2. Direct subpath match: prefer canonical extensionless and un-prefixed form
  if (rel && rel !== '.') {
    if (relNoPrefix && relNoPrefix !== relNoExt) {
      candidates.add(`${pkgName}/${relNoPrefix}`);
    }
    candidates.add(`${pkgName}/${relNoExt}`);
    candidates.add(`${pkgName}/${rel}`);
  }

  // 3. Match against package.json "exports" field
  if (pkg.exports && typeof pkg.exports === 'object') {
    for (const [exportKey, exportVal] of Object.entries(pkg.exports)) {
      const cleanExportKey = exportKey.replace(/^\.\/?/, '');
      const candidate = cleanExportKey
        ? `${pkgName}/${cleanExportKey}`
        : pkgName;

      if (!isSharedKeyMatch(candidate, sharedKeys)) {
        continue;
      }

      if (cleanExportKey === relNoExt || cleanExportKey === relNoPrefix) {
        candidates.add(candidate);
        continue;
      }

      if (typeof exportVal === 'string') {
        const fullExport = path.resolve(pkg.dir, exportVal);
        const fullExportNoExt = fullExport.replace(STRIP_EXT_REGEX, '');
        const targetPathNoExt = targetPath.replace(STRIP_EXT_REGEX, '');
        if (fullExport === targetPath || fullExportNoExt === targetPathNoExt) {
          candidates.add(candidate);
        }
      } else if (exportVal && typeof exportVal === 'object') {
        for (const subVal of Object.values(exportVal)) {
          if (typeof subVal === 'string') {
            const fullExport = path.resolve(pkg.dir, subVal);
            const fullExportNoExt = fullExport.replace(STRIP_EXT_REGEX, '');
            const targetPathNoExt = targetPath.replace(STRIP_EXT_REGEX, '');
            if (
              fullExport === targetPath ||
              fullExportNoExt === targetPathNoExt
            ) {
              candidates.add(candidate);
              break;
            }
          }
        }
      }
    }
  }

  for (const c of candidates) {
    if (isSharedKeyMatch(c, sharedKeys)) {
      return c;
    }
  }

  return null;
}

/**
 * Compiler plugin that rewrites relative import requests to their canonical shared specifiers
 * before module factorization, ensuring relative imports inside a shared library negotiate
 * the shared singleton instance instead of bundling duplicate local instances.
 */
export class CanonicalSharedPlugin {
  readonly name = 'CanonicalSharedPlugin';
  private _sharedKeys: SharedKeysSet;

  constructor(shared: unknown) {
    this._sharedKeys = extractSharedKeys(shared);
  }

  apply(compiler: any): void {
    if (!this._sharedKeys.size) {
      return;
    }

    compiler.hooks.normalModuleFactory.tap(
      'CanonicalSharedPlugin',
      (nmf: any) => {
        nmf.hooks.beforeResolve.tap(
          'CanonicalSharedPlugin',
          (resolveData: any) => {
            if (
              !resolveData ||
              !resolveData.request ||
              !resolveData.request.startsWith('.')
            ) {
              return;
            }
            const canonical = resolveCanonicalShareKey(
              resolveData.context,
              resolveData.request,
              this._sharedKeys,
            );
            if (canonical) {
              resolveData.request = canonical;
            }
          },
        );
      },
    );
  }
}
