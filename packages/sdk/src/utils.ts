import { RemoteEntryInfo, ModuleInfo } from './types';
import {
  NameTransformMap,
  NameTransformSymbol,
  EncodedNameTransformMap,
  SEPARATOR,
  MANIFEST_EXT,
} from './constant';
import { getProcessEnv } from './env';

const LOG_CATEGORY = '[ Federation Runtime ]';

// entry: name:version   version : 1.0.0 | ^1.2.3
// entry: name:entry  entry:  https://localhost:9000/federation-manifest.json
const parseEntry = (
  str: string,
  devVerOrUrl?: string,
  separator = SEPARATOR,
): RemoteEntryInfo => {
  const strSplit = str.split(separator);
  const devVersionOrUrl =
    getProcessEnv()['NODE_ENV'] === 'development' && devVerOrUrl;
  const defaultVersion = '*';
  const isEntry = (s: string) =>
    s.startsWith('http') || s.includes(MANIFEST_EXT);

  // Check if the string starts with a type
  if (strSplit.length >= 2) {
    let [name, ...versionOrEntryArr] = strSplit;
    // @name@manifest-url.json
    if (str.startsWith(separator)) {
      name = strSplit.slice(0, 2).join(separator);
      versionOrEntryArr = [
        devVersionOrUrl || strSplit.slice(2).join(separator),
      ];
    }

    let versionOrEntry = devVersionOrUrl || versionOrEntryArr.join(separator);

    if (isEntry(versionOrEntry)) {
      return {
        name,
        entry: versionOrEntry,
      };
    } else {
      // Apply version rule
      // devVersionOrUrl => inputVersion => defaultVersion
      return {
        name,
        version: versionOrEntry || defaultVersion,
      };
    }
  } else if (strSplit.length === 1) {
    const [name] = strSplit;
    if (devVersionOrUrl && isEntry(devVersionOrUrl)) {
      return {
        name,
        entry: devVersionOrUrl,
      };
    }
    return {
      name,
      version: devVersionOrUrl || defaultVersion,
    };
  } else {
    throw `Invalid entry value: ${str}`;
  }
};

declare global {
  // eslint-disable-next-line no-var
  var FEDERATION_DEBUG: string | undefined;
}

const composeKeyWithSeparator = function (
  ...args: (string | undefined)[]
): string {
  if (!args.length) {
    return '';
  }

  return args.reduce((sum, cur) => {
    if (!cur) {
      return sum;
    }
    if (!sum) {
      return cur;
    }

    return `${sum}${SEPARATOR}${cur}`;
  }, '') as string;
};

const encodeName = function (
  name: string,
  prefix = '',
  withExt = false,
): string {
  try {
    const ext = withExt ? '.js' : '';
    return `${prefix}${name
      .replace(
        new RegExp(`${NameTransformSymbol.AT}`, 'g'),
        NameTransformMap[NameTransformSymbol.AT],
      )
      .replace(
        new RegExp(`${NameTransformSymbol.HYPHEN}`, 'g'),
        NameTransformMap[NameTransformSymbol.HYPHEN],
      )
      .replace(
        new RegExp(`${NameTransformSymbol.SLASH}`, 'g'),
        NameTransformMap[NameTransformSymbol.SLASH],
      )}${ext}`;
  } catch (err) {
    throw err;
  }
};

const decodeName = function (
  name: string,
  prefix?: string,
  withExt?: boolean,
): string {
  try {
    let decodedName = name;
    if (prefix) {
      if (!decodedName.startsWith(prefix)) {
        return decodedName;
      }
      decodedName = decodedName.replace(new RegExp(prefix, 'g'), '');
    }
    decodedName = decodedName
      .replace(
        new RegExp(`${NameTransformMap[NameTransformSymbol.AT]}`, 'g'),
        EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.AT]],
      )
      .replace(
        new RegExp(`${NameTransformMap[NameTransformSymbol.SLASH]}`, 'g'),
        EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.SLASH]],
      )
      .replace(
        new RegExp(`${NameTransformMap[NameTransformSymbol.HYPHEN]}`, 'g'),
        EncodedNameTransformMap[NameTransformMap[NameTransformSymbol.HYPHEN]],
      );
    if (withExt) {
      decodedName = decodedName.replace('.js', '');
    }
    return decodedName;
  } catch (err) {
    throw err;
  }
};

const generateExposeFilename = (
  exposeName: string,
  withExt: boolean,
): string => {
  if (!exposeName) {
    return '';
  }

  let expose = exposeName;
  if (expose === '.') {
    expose = 'default_export';
  }
  if (expose.startsWith('./')) {
    expose = expose.replace('./', '');
  }

  return encodeName(expose, '__federation_expose_', withExt);
};

const generateShareFilename = (pkgName: string, withExt: boolean): string => {
  if (!pkgName) {
    return '';
  }
  return encodeName(pkgName, '__federation_shared_', withExt);
};

const getResourceUrl = (module: ModuleInfo, sourceUrl: string): string => {
  if ('getPublicPath' in module) {
    let publicPath;

    if (!module.getPublicPath.startsWith('function')) {
      publicPath = new Function(module.getPublicPath)();
    } else {
      publicPath = new Function('return ' + module.getPublicPath)()();
    }

    return `${publicPath}${sourceUrl}`;
  } else if ('publicPath' in module) {
    return `${module.publicPath}${sourceUrl}`;
  } else {
    console.warn(
      'Cannot get resource URL. If in debug mode, please ignore.',
      module,
      sourceUrl,
    );
    return '';
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const assert = (condition: any, msg: string): asserts condition => {
  if (!condition) {
    error(msg);
  }
};

const error = (msg: string | Error | unknown): never => {
  throw new Error(`${LOG_CATEGORY}: ${msg}`);
};

const warn = (msg: Parameters<typeof console.warn>[0]): void => {
  console.warn(`${LOG_CATEGORY}: ${msg}`);
};

function safeToString(info: any): string {
  try {
    return JSON.stringify(info, null, 2);
  } catch (e) {
    return '';
  }
}

// RegExp for version string
const VERSION_PATTERN_REGEXP: RegExp = /^([\d^=v<>~]|[*xX]$)/;

function isRequiredVersion(str: string): boolean {
  return VERSION_PATTERN_REGEXP.test(str);
}

export {
  parseEntry,
  decodeName,
  encodeName,
  composeKeyWithSeparator,
  generateExposeFilename,
  generateShareFilename,
  getResourceUrl,
  assert,
  error,
  warn,
  safeToString,
  isRequiredVersion,
};
