import fs from 'fs';
import path from 'path';
import process from 'process';
import { getConfigContext } from './configuration-context';
import { SharedConfig } from './federation-config';
import { getVersionMaps, findDepPackageJson } from '../utils/package-info';
import { logger } from '../utils/logger';
import {
  isInSkipList,
  prepareSkipList,
  DEFAULT_SKIP_LIST,
  PREPARED_DEFAULT_SKIP_LIST,
  SkipListEntry,
} from '../core/default-skip-list';

type IncludeSecondariesOptions =
  | {
      skip: string | string[];
    }
  | boolean;

type CustomSharedConfig = SharedConfig & {
  includeSecondaries?: IncludeSecondariesOptions;
};

type ConfigObject = Record<string, CustomSharedConfig>;
type Config = (string | ConfigObject)[] | ConfigObject;

let inferVersion = false;

export const DEFAULT_SECONARIES_SKIP_LIST: string[] = [
  '@angular/router/upgrade',
  '@angular/common/upgrade',
];

export function findRootTsConfigJson(): string {
  const packageJson = findPackageJson(process.cwd());
  const projectRoot = path.dirname(packageJson);
  const tsConfigBaseJson = path.join(projectRoot, 'tsconfig.base.json');
  const tsConfigJson = path.join(projectRoot, 'tsconfig.json');
  if (fs.existsSync(tsConfigBaseJson)) {
    return tsConfigBaseJson;
  } else if (fs.existsSync(tsConfigJson)) {
    return tsConfigJson;
  }
  throw new Error('Neither a tsconfig.json nor a tsconfig.base.json was found');
}

export function findPackageJson(folder: string): string {
  while (
    !fs.existsSync(path.join(folder, 'package.json')) &&
    path.dirname(folder) !== folder
  ) {
    folder = path.dirname(folder);
  }
  const filePath = path.join(folder, 'package.json');
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  throw new Error(
    `No package.json found. Searched the following folder and all parents: ${folder}`,
  );
}

export function lookupVersion(key: string, workspaceRoot: string): string {
  const versionMaps = getVersionMaps(workspaceRoot, workspaceRoot);
  for (const versionMap of versionMaps) {
    const version = lookupVersionInMap(key, versionMap);
    if (version) {
      return version;
    }
  }
  throw new Error(
    `Shared Dependency ${key} has requiredVersion:'auto'. However, this dependency is not found in your package.json`,
  );
}

export function lookupVersionInMap(
  key: string,
  versions: Record<string, string>,
): string | null {
  const parts = key.split('/');
  if (parts.length >= 2 && parts[0].startsWith('@')) {
    key = `${parts[0]}/${parts[1]}`;
  } else {
    key = parts[0];
  }
  if (key.toLowerCase() === '@angular-architects/module-federation-runtime') {
    key = '@angular-architects/module-federation';
  }
  return versions[key] || null;
}

export function _findSecondaries(
  libPath: string,
  excludes: string[],
  shareObject: Record<string, any>,
  acc: Record<string, any>,
): void {
  const files = fs.readdirSync(libPath);
  const dirs = files
    .map((f) => path.join(libPath, f))
    .filter((f) => fs.lstatSync(f).isDirectory() && f !== 'node_modules');
  const secondaries = dirs.filter((d) =>
    fs.existsSync(path.join(d, 'package.json')),
  );
  for (const s of secondaries) {
    const secondaryLibName = s
      .replace(/\\/g, '/')
      .replace(/^.*node_modules[/]/, '');
    if (excludes.includes(secondaryLibName)) {
      continue;
    }
    if (isInSkipList(secondaryLibName, PREPARED_DEFAULT_SKIP_LIST)) {
      continue;
    }
    acc[secondaryLibName] = { ...shareObject };
    _findSecondaries(s, excludes, shareObject, acc);
  }
}

export function findSecondaries(
  libPath: string,
  excludes: string[],
  shareObject: Record<string, any>,
): Record<string, any> {
  const acc: Record<string, any> = {};
  _findSecondaries(libPath, excludes, shareObject, acc);
  return acc;
}

export function getSecondaries(
  includeSecondaries: boolean | { skip?: string | string[] },
  libPath: string,
  key: string,
  shareObject: Record<string, any>,
): Record<string, any> {
  let exclude = [...DEFAULT_SECONARIES_SKIP_LIST];
  if (typeof includeSecondaries === 'object') {
    if (Array.isArray(includeSecondaries.skip)) {
      exclude = includeSecondaries.skip;
    } else if (typeof includeSecondaries.skip === 'string') {
      exclude = [includeSecondaries.skip];
    }
  }
  if (!fs.existsSync(libPath)) {
    return {};
  }
  const configured = readConfiguredSecondaries(
    key,
    libPath,
    exclude,
    shareObject,
  );
  if (configured) {
    return configured;
  }
  // Fallback: Search folders
  return findSecondaries(libPath, exclude, shareObject);
}

export function readConfiguredSecondaries(
  parent: string,
  libPath: string,
  exclude: string[],
  shareObject: Record<string, any>,
): Record<string, any> | null {
  const libPackageJson = path.join(libPath, 'package.json');
  if (!fs.existsSync(libPackageJson)) {
    return null;
  }
  const packageJson = JSON.parse(fs.readFileSync(libPackageJson, 'utf-8'));
  const exports = packageJson['exports'];
  if (!exports) {
    return null;
  }
  const keys = Object.keys(exports).filter(
    (key) =>
      key !== '.' &&
      key !== './package.json' &&
      !key.endsWith('*') &&
      (exports[key]['default'] || typeof exports[key] === 'string'),
  );
  const result: Record<string, any> = {};
  for (const key of keys) {
    const secondaryName = path.join(parent, key).replace(/\\/g, '/');
    if (exclude.includes(secondaryName)) {
      continue;
    }
    if (isInSkipList(secondaryName, PREPARED_DEFAULT_SKIP_LIST)) {
      continue;
    }
    const entry = getDefaultEntry(exports, key);
    if (typeof entry !== 'string') {
      console.log(`No entry point found for ${secondaryName}`);
      continue;
    }
    if (['.css', '.scss', '.less'].some((ext) => entry.endsWith(ext))) {
      continue;
    }
    result[secondaryName] = { ...shareObject };
  }
  return result;
}

export function getDefaultEntry(
  exports: { [key: string]: any },
  key: string,
): string {
  let entry;
  if (typeof exports[key] === 'string') {
    entry = exports[key];
  } else {
    entry = exports[key]?.['default'];
    if (typeof entry === 'object') {
      entry = entry['default'];
    }
  }
  return entry;
}

export function shareAll(
  config: CustomSharedConfig,
  skip: SkipListEntry[] = DEFAULT_SKIP_LIST,
  projectPath: string = '',
): Config {
  projectPath = inferProjectPath(projectPath);
  const versionMaps = getVersionMaps(projectPath, projectPath);
  const shareConfig: ConfigObject = {};
  for (const versions of versionMaps) {
    const preparedSkipList = prepareSkipList(skip);
    for (const key in versions) {
      if (isInSkipList(key, preparedSkipList)) {
        continue;
      }
      const inferVersion =
        !config.requiredVersion || config.requiredVersion === 'auto';
      const requiredVersion = inferVersion
        ? versions[key]
        : config.requiredVersion;
      if (!shareConfig[key]) {
        shareConfig[key] = { ...config, requiredVersion };
      }
    }
  }
  return share(share, projectPath);
}

function inferProjectPath(projectPath: string): string {
  if (!projectPath) {
    projectPath = path.dirname(getConfigContext().packageJson || '');
  }
  if (!projectPath && getConfigContext().workspaceRoot) {
    projectPath = getConfigContext().workspaceRoot || '';
  }
  if (!projectPath) {
    projectPath = process.cwd();
  }
  return projectPath;
}

export function setInferVersion(infer: boolean): void {
  inferVersion = infer;
}

export function share(
  shareObjects: Record<string, any>,
  projectPath: string = '',
): Record<string, any> {
  projectPath = inferProjectPath(projectPath);
  const packagePath = findPackageJson(projectPath);
  const result: Record<string, any> = {};
  let includeSecondaries: boolean | { skip?: string | string[] };
  for (const key in shareObjects) {
    includeSecondaries = false;
    const shareObject = shareObjects[key];
    if (
      shareObject.requiredVersion === 'auto' ||
      (inferVersion && typeof shareObject.requiredVersion === 'undefined')
    ) {
      const version = lookupVersion(key, projectPath);
      shareObject.requiredVersion = version;
      shareObject.version = version.replace(/^\D*/, '');
    }
    if (typeof shareObject.includeSecondaries === 'undefined') {
      shareObject.includeSecondaries = true;
    }
    if (shareObject.includeSecondaries) {
      includeSecondaries = shareObject.includeSecondaries;
      delete shareObject.includeSecondaries;
    }
    result[key] = shareObject;
    if (includeSecondaries) {
      const libPackageJson = findDepPackageJson(key, path.dirname(packagePath));
      if (!libPackageJson) {
        logger.error(`Could not find folder containing dep ${key}`);
        continue;
      }
      const libPath = path.dirname(libPackageJson);
      const secondaries = getSecondaries(
        includeSecondaries,
        libPath,
        key,
        shareObject,
      );
      if (secondaries) {
        addSecondaries(secondaries, result);
      }
    }
  }
  return result;
}

export function addSecondaries(
  secondaries: Record<string, any>,
  result: Record<string, any>,
): void {
  Object.assign(result, secondaries);
}
