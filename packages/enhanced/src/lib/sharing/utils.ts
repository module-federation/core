/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

import { isRequiredVersion } from '@module-federation/sdk';
import type { ConsumeOptions } from 'webpack/lib/sharing/ConsumeSharedModule';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { InputFileSystem } from 'webpack/lib/util/fs';
const { join, dirname, readJson } = require(
  normalizeWebpackPath('webpack/lib/util/fs'),
) as typeof import('webpack/lib/util/fs');

// Extreme shorthand only for github. eg: foo/bar
const RE_URL_GITHUB_EXTREME_SHORT = /^[^/@:.\s][^/@:\s]*\/[^@:\s]*[^/@:\s]#\S+/;

// Short url with specific protocol. eg: github:foo/bar
const RE_GIT_URL_SHORT = /^(github|gitlab|bitbucket|gist):\/?[^/.]+\/?/i;

// Currently supported protocols
const RE_PROTOCOL =
  /^((git\+)?(ssh|https?|file)|git|github|gitlab|bitbucket|gist):$/i;

// Has custom protocol
const RE_CUSTOM_PROTOCOL = /^((git\+)?(ssh|https?|file)|git):\/\//i;

// Valid hash format for npm / yarn ...
const RE_URL_HASH_VERSION = /#(?:semver:)?(.+)/;

// Simple hostname validate
const RE_HOSTNAME = /^(?:[^/.]+(\.[^/]+)+|localhost)$/;

// For hostname with colon. eg: ssh://user@github.com:foo/bar
const RE_HOSTNAME_WITH_COLON =
  /([^/@#:.]+(?:\.[^/@#:.]+)+|localhost):([^#/0-9]+)/;

// Reg for url without protocol
const RE_NO_PROTOCOL = /^([^/@#:.]+(?:\.[^/@#:.]+)+)/;

// Specific protocol for short url without normal hostname
const PROTOCOLS_FOR_SHORT = [
  'github:',
  'gitlab:',
  'bitbucket:',
  'gist:',
  'file:',
];

// Default protocol for git url
const DEF_GIT_PROTOCOL = 'git+ssh://';

// thanks to https://github.com/npm/hosted-git-info/blob/latest/git-host-info.js
const extractCommithashByDomain: {
  [key: string]: (pathname: string, hash: string) => string | undefined;
} = {
  /**
   * @param {string} pathname pathname
   * @param {string} hash hash
   * @returns {string | undefined} hash
   */
  'github.com': (pathname: string, hash: string) => {
    const [, user, project, type, commithash] = pathname.split('/', 5);
    if (type && type !== 'tree') {
      return;
    }

    let commithashResult = commithash;
    if (!type) {
      commithashResult = hash;
    } else {
      commithashResult = '#' + commithash;
    }

    let projectResult = project;
    if (project && project.endsWith('.git')) {
      projectResult = project.slice(0, -4);
    }

    if (!user || !projectResult) {
      return;
    }

    return commithashResult;
  },
  /**
   * @param {string} pathname pathname
   * @param {string} hash hash
   * @returns {string | undefined} hash
   */
  'gitlab.com': (pathname: string, hash: string) => {
    const path = pathname.slice(1);
    if (path.includes('/-/') || path.includes('/archive.tar.gz')) {
      return;
    }

    const segments = path.split('/');
    let project = segments.pop();
    if (project && project.endsWith('.git')) {
      project = project.slice(0, -4);
    }

    const user = segments.join('/');
    if (!user || !project) {
      return;
    }

    return hash;
  },
  /**
   * @param {string} pathname pathname
   * @param {string} hash hash
   * @returns {string | undefined} hash
   */
  'bitbucket.org': (pathname: string, hash: string) => {
    const [, user, project, aux] = pathname.split('/', 4);
    if (['get'].includes(aux)) {
      return;
    }

    let projectResult = project;
    if (project && project.endsWith('.git')) {
      projectResult = project.slice(0, -4);
    }

    if (!user || !projectResult) {
      return;
    }

    return hash;
  },
  /**
   * @param {string} pathname pathname
   * @param {string} hash hash
   * @returns {string | undefined} hash
   */
  'gist.github.com': (pathname: string, hash: string) => {
    const [, user, project, aux] = pathname.split('/', 4);
    if (aux === 'raw') {
      return;
    }

    let projectResult = project;
    if (!projectResult) {
      if (!user) {
        return;
      }

      projectResult = user;
    }

    if (projectResult.endsWith('.git')) {
      projectResult = projectResult.slice(0, -4);
    }

    return hash;
  },
};

/**
 * extract commit hash from parsed url
 *
 * @inner
 * @param {URL} urlParsed parsed url
 * @returns {string} commithash
 */
function getCommithash(urlParsed: URL): string {
  const { hostname, pathname, hash } = urlParsed;
  const hostnameResult = hostname.replace(/^www\./, '');

  let hashResult = hash;
  try {
    hashResult = decodeURIComponent(hash);
    // eslint-disable-next-line no-empty
  } catch (e) {}

  if (
    /** @type {keyof extractCommithashByDomain} */ extractCommithashByDomain[
      hostnameResult
    ]
  ) {
    return (
      extractCommithashByDomain
        /** @type {keyof extractCommithashByDomain} */ [hostnameResult](
          pathname,
          hashResult,
        ) || ''
    );
  }

  return hashResult;
}

/**
 * make url right for URL parse
 *
 * @inner
 * @param {string} gitUrl git url
 * @returns {string} fixed url
 */
function correctUrl(gitUrl: string): string {
  // like:
  // proto://hostname.com:user/repo -> proto://hostname.com/user/repo
  return gitUrl.replace(RE_HOSTNAME_WITH_COLON, '$1/$2');
}

/**
 * make url protocol right for URL parse
 *
 * @inner
 * @param {string} gitUrl git url
 * @returns {string} fixed url
 */
function correctProtocol(gitUrl: string): string {
  // eg: github:foo/bar#v1.0. Should not add double slash, in case of error parsed `pathname`
  if (RE_GIT_URL_SHORT.test(gitUrl)) {
    return gitUrl;
  }

  // eg: user@github.com:foo/bar
  if (!RE_CUSTOM_PROTOCOL.test(gitUrl)) {
    return `${DEF_GIT_PROTOCOL}${gitUrl}`;
  }

  return gitUrl;
}

/**
 * extract git dep version from hash
 *
 * @inner
 * @param {string} hash hash
 * @returns {string} git dep version
 */
function getVersionFromHash(hash: string): string {
  const matched = hash.match(RE_URL_HASH_VERSION);

  return (matched && matched[1]) || '';
}

/**
 * if string can be decoded
 *
 * @inner
 * @param {string} str str to be checked
 * @returns {boolean} if can be decoded
 */
function canBeDecoded(str: string): boolean {
  try {
    decodeURIComponent(str);
  } catch (e) {
    return false;
  }

  return true;
}

/**
 * get right dep version from git url
 *
 * @inner
 * @param {string} gitUrl git url
 * @returns {string} dep version
 */
function getGitUrlVersion(gitUrl: string): string {
  const oriGitUrl = gitUrl;
  // github extreme shorthand
  if (RE_URL_GITHUB_EXTREME_SHORT.test(gitUrl)) {
    gitUrl = 'github:' + gitUrl;
  } else {
    gitUrl = correctProtocol(gitUrl);
  }

  gitUrl = correctUrl(gitUrl);

  let parsed;
  try {
    parsed = new URL(gitUrl);
    // eslint-disable-next-line no-empty
  } catch (e) {}

  if (!parsed) {
    return '';
  }

  const { protocol, hostname, pathname, username, password } = parsed;
  if (!RE_PROTOCOL.test(protocol)) {
    return '';
  }

  // pathname shouldn't be empty or URL malformed
  if (!pathname || !canBeDecoded(pathname)) {
    return '';
  }

  // without protocol, there should have auth info
  if (RE_NO_PROTOCOL.test(oriGitUrl) && !username && !password) {
    return '';
  }

  if (!PROTOCOLS_FOR_SHORT.includes(protocol.toLowerCase())) {
    if (!RE_HOSTNAME.test(hostname)) {
      return '';
    }

    const commithash = getCommithash(parsed);
    return getVersionFromHash(commithash) || commithash;
  }

  // for protocol short
  return getVersionFromHash(gitUrl);
}

/**
 * @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#urls-as-dependencies
 * @param {string} versionDesc version to be normalized
 * @returns {string} normalized version
 */
function normalizeVersion(versionDesc: string): string {
  versionDesc = (versionDesc && versionDesc.trim()) || '';

  if (isRequiredVersion(versionDesc)) {
    return versionDesc;
  }

  // add handle for URL Dependencies
  return getGitUrlVersion(versionDesc.toLowerCase());
}

export { normalizeVersion };

/** @typedef {{ data: Record<string, any>, path: string }} DescriptionFile */

interface DescriptionFile {
  data: Record<string, any>;
  path: string;
}

/**
 *
 * @param {InputFileSystem} fs file system
 * @param {string} directory directory to start looking into
 * @param {string[]} descriptionFiles possible description filenames
 * @param {function((Error | null)=, {data?: DescriptionFile, path?: string}=, (checkedDescriptionFilePaths: string[])=): void} callback callback
 * @param {function({data: DescriptionFile}=): boolean} satisfiesDescriptionFileData file data compliance check
 * @param {Set<string>} [checkedFilePaths] optional set to track checked file paths
 */
function getDescriptionFile(
  fs: InputFileSystem,
  directory: string,
  descriptionFiles: string[],
  callback: (
    err: Error | null,
    data?: DescriptionFile,
    checkedDescriptionFilePaths?: string[],
  ) => void,
  satisfiesDescriptionFileData?: (data?: DescriptionFile) => boolean,
  checkedFilePaths: Set<string> = new Set<string>(), // Default to a new Set if not provided
) {
  let i = 0;

  // Create an object to hold the function and the shared checkedFilePaths
  const satisfiesDescriptionFileDataInternal = {
    check: satisfiesDescriptionFileData,
    checkedFilePaths: checkedFilePaths, // Use the passed Set instance
  };

  const tryLoadCurrent = () => {
    if (i >= descriptionFiles.length) {
      const parentDirectory = dirname(fs, directory);
      if (!parentDirectory || parentDirectory === directory) {
        return callback(
          null,
          undefined,
          Array.from(satisfiesDescriptionFileDataInternal.checkedFilePaths),
        );
      }
      return getDescriptionFile(
        fs,
        parentDirectory,
        descriptionFiles,
        callback,
        satisfiesDescriptionFileDataInternal.check,
        satisfiesDescriptionFileDataInternal.checkedFilePaths, // Pass the same Set
      );
    }
    const filePath = join(fs, directory, descriptionFiles[i]);
    readJson(fs, filePath, (err, data: object) => {
      if (err) {
        if ('code' in err && err.code === 'ENOENT') {
          i++;
          return tryLoadCurrent();
        }
        return callback(err);
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return callback(
          new Error(`Description file ${filePath} is not an object`),
        );
      }
      if (
        typeof satisfiesDescriptionFileDataInternal.check === 'function' &&
        !satisfiesDescriptionFileDataInternal.check({ data, path: filePath })
      ) {
        i++;
        satisfiesDescriptionFileDataInternal.checkedFilePaths.add(filePath);
        return tryLoadCurrent();
      }
      callback(null, { data, path: filePath });
    });
  };
  tryLoadCurrent();
}
export { getDescriptionFile };
/**
 * Get required version from description file
 * @param {Record<string, any>} data - The data object
 * @param {string} packageName - The package name
 * @returns {string | undefined} The normalized version
 */
export function getRequiredVersionFromDescriptionFile(
  data: Record<string, any>,
  packageName: string,
): string | undefined | void {
  if (
    data['optionalDependencies'] &&
    typeof data['optionalDependencies'] === 'object' &&
    packageName in data['optionalDependencies']
  ) {
    return normalizeVersion(data['optionalDependencies'][packageName]);
  }
  if (
    data['dependencies'] &&
    typeof data['dependencies'] === 'object' &&
    packageName in data['dependencies']
  ) {
    return normalizeVersion(data['dependencies'][packageName]);
  }
  if (
    data['peerDependencies'] &&
    typeof data['peerDependencies'] === 'object' &&
    packageName in data['peerDependencies']
  ) {
    return normalizeVersion(data['peerDependencies'][packageName]);
  }
  if (
    data['devDependencies'] &&
    typeof data['devDependencies'] === 'object' &&
    packageName in data['devDependencies']
  ) {
    return normalizeVersion(data['devDependencies'][packageName]);
  }
}

export function normalizeConsumeShareOptions(consumeOptions: ConsumeOptions) {
  const {
    requiredVersion = false,
    strictVersion,
    singleton = false,
    eager,
    shareKey,
    shareScope,
  } = consumeOptions;
  return {
    shareConfig: {
      fixedDependencies: false,
      requiredVersion,
      strictVersion,
      singleton,
      eager,
    },
    shareScope,
    shareKey,
  };
}
