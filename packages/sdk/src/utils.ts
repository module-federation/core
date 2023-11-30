import { RemoteEntryInfo, ModuleInfo } from './types';
import {
  NameTransformMap,
  NameTransformSymbol,
  EncodedNameTransformMap,
  SEPARATOR,
  MANIFEST_EXT,
} from './constant';
import { Logger } from './logger';
import { getProcessEnv } from './env';

// entry: name:version   version : 1.0.0 | ^1.2.3
// entry: name:entry  entry:  https://localhost:9000/federation-manifest.json
const parseEntry = (str: string, devVerOrUrl?: string): RemoteEntryInfo => {
  const strSplit = str.split(SEPARATOR);
  const devVersionOrUrl =
    getProcessEnv()['NODE_ENV'] === 'development' && devVerOrUrl;
  const defaultVersion = '*';
  const isEntry = (s: string) =>
    s.startsWith('http') || s.endsWith(MANIFEST_EXT);

  // Check if the string starts with a type
  if (strSplit.length >= 2) {
    const [name, ...versionOrEntryArr] = strSplit;
    const versionOrEntry = devVersionOrUrl || versionOrEntryArr.join(SEPARATOR);
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

const logger = new Logger();

const composeKeyWithSeparator = /* @__PURE__ */ function (
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

const encodeName = /* @__PURE__ */ function (
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

const decodeName = /* @__PURE__ */ function (
  name: string,
  prefix?: string,
  withExt?: boolean,
): string {
  try {
    let decodedName = name;
    if (prefix) {
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

const generateExposeFilename = /* @__PURE__ */ (
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

const generateShareFilename = /* @__PURE__ */ (
  pkgName: string,
  withExt: boolean,
): string => {
  if (!pkgName) {
    return '';
  }
  return encodeName(pkgName, '__federation_shared_', withExt);
};

const getResourceUrl = (module: ModuleInfo, sourceUrl: string): string => {
  if ('getPublicPath' in module) {
    const publicPath = new Function(module.getPublicPath)();
    return `${publicPath}${sourceUrl}`;
  } else if ('publicPath' in module) {
    return `${module.publicPath}${sourceUrl}`;
  } else {
    console.warn(
      'Can not get resource url, if in debug mode, please ignore',
      module,
      sourceUrl,
    );
    return '';
  }
};

export {
  parseEntry,
  logger,
  decodeName,
  encodeName,
  composeKeyWithSeparator,
  generateExposeFilename,
  generateShareFilename,
  getResourceUrl,
};
