import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';
import { normalize } from './normalize';

interface PackageJsonInfo {
  content: any;
  directory: string;
}

const packageCache: Record<string, PackageJsonInfo[]> = {};

export function findPackageJsonFiles(
  project: string,
  workspace: string,
): string[] {
  return expandFolders(project, workspace)
    .map((f) => path.join(f, 'package.json'))
    .filter((f) => fs.existsSync(f));
}

export function expandFolders(child: string, parent: string): string[] {
  const result: string[] = [];
  parent = normalize(parent, true);
  child = normalize(child, true);
  if (!child.startsWith(parent)) {
    throw new Error(
      `Workspace folder ${parent} needs to be a parent of the project folder ${child}`,
    );
  }
  let current = child;
  while (current !== parent) {
    result.push(current);
    const cand = normalize(path.dirname(current), true);
    if (cand === current) {
      break;
    }
    current = cand;
  }
  result.push(parent);
  return result;
}

function getVersionMapCacheKey(project: string, workspace: string): string {
  return `${project}**${workspace}`;
}

export function getVersionMaps(
  project: string,
  workspace: string,
): Record<string, string>[] {
  return getPackageJsonFiles(project, workspace).map((json) => ({
    ...json.content['dependencies'],
  }));
}

export function getPackageJsonFiles(
  project: string,
  workspace: string,
): PackageJsonInfo[] {
  const cacheKey = getVersionMapCacheKey(project, workspace);
  let maps = packageCache[cacheKey];
  if (maps) {
    return maps;
  }
  maps = findPackageJsonFiles(project, workspace).map((f) => {
    const content = JSON.parse(fs.readFileSync(f, 'utf-8'));
    const directory = normalize(path.dirname(f), true);
    const result: PackageJsonInfo = {
      content,
      directory,
    };
    return result;
  });
  packageCache[cacheKey] = maps;
  return maps;
}

export function findDepPackageJson(
  packageName: string,
  projectRoot: string,
): string | null {
  const mainPkgName = getPkgFolder(packageName);
  let mainPkgPath = path.join(projectRoot, 'node_modules', mainPkgName);
  let mainPkgJsonPath = path.join(mainPkgPath, 'package.json');
  let directory = projectRoot;
  while (path.dirname(directory) !== directory) {
    if (fs.existsSync(mainPkgJsonPath)) {
      break;
    }
    directory = normalize(path.dirname(directory), true);
    mainPkgPath = path.join(directory, 'node_modules', mainPkgName);
    mainPkgJsonPath = path.join(mainPkgPath, 'package.json');
  }
  if (!fs.existsSync(mainPkgJsonPath)) {
    logger.verbose(
      'No package.json found for ' + packageName + ' in ' + mainPkgPath,
    );
    return null;
  }
  return mainPkgJsonPath;
}

function getPkgFolder(packageName: string): string {
  const parts = packageName.split('/');
  let folder = parts[0];
  if (folder.startsWith('@')) {
    folder += '/' + parts[1];
  }
  return folder;
}
