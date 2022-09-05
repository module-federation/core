import { parseOptions } from 'webpack/lib/container/options';
import { isRequiredVersion } from 'webpack/lib/sharing/utils';

export const DEFAULT_SHARE_SCOPE = {
  react: {
    singleton: true,
    requiredVersion: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
  },
  'next/dynamic': {
    requiredVersion: false,
    singleton: true,
  },
  'styled-jsx': {
    requiredVersion: false,
    singleton: true,
  },
  'next/link': {
    requiredVersion: false,
    singleton: true,
  },
  'next/router': {
    requiredVersion: false,
    singleton: true,
  },
  'next/script': {
    requiredVersion: false,
    singleton: true,
  },
  'next/head': {
    requiredVersion: false,
    singleton: true,
  },
};

export const reKeyHostShared = (options) => {
  return Object.entries({
    ...(options || {}),
    ...DEFAULT_SHARE_SCOPE,
  }).reduce((acc, item) => {
    const [itemKey, shareOptions] = item;

    const shareKey = 'host' + (item.shareKey || itemKey);
    acc[shareKey] = shareOptions;
    if (!shareOptions.import) {
      acc[shareKey].import = itemKey;
    }
    if (!shareOptions.shareKey) {
      acc[shareKey].shareKey = itemKey;
    }

    if (DEFAULT_SHARE_SCOPE[itemKey]) {
      acc[shareKey].packageName = itemKey;
    }
    return acc;
  }, {});
};

export const extractUrlAndGlobal = (urlAndGlobal) => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};

export const generateRemoteTemplate = (url, global) => {
  return `promise new Promise(function (resolve, reject) {
  console.log('using browser template');
    var __webpack_error__ = new Error();
    if (typeof ${global} !== 'undefined') return resolve();
    __webpack_require__.l(
      ${JSON.stringify(url)},
      function (event) {
        if (typeof ${global} !== 'undefined') return resolve();
        var errorType = event && (event.type === 'load' ? 'missing' : event.type);
        var realSrc = event && event.target && event.target.src;
        __webpack_error__.message =
          'Loading script failed.\\n(' + errorType + ': ' + realSrc + ')';
        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;
        reject(__webpack_error__);
      },
      ${JSON.stringify(global)},
    );
  }).then(function () {
    const proxy = {
      get: ${global}.get,
      init: (args) => {
        const handler = {
          get(target, prop) {
            if (target[prop]) {
              Object.values(target[prop]).forEach(function(o) {
                if(o.from === '_N_E') {
                  o.loaded = true
                }
              })
            }
            return target[prop]
          },
          set(target, property, value, receiver) {
            if (target[property]) {
              return target[property]
            }
            target[property] = value
            return true
          }
        }
        try {
          ${global}.init(new Proxy(__webpack_require__.S.default, handler))
        } catch (e) {

        }
        ${global}.__initialized = true
      }
    }
    if (!${global}.__initialized) {
      proxy.init()
    }
    return proxy
  })`;
};

const parseShareOptions = (options) => {
  const sharedOptions = parseOptions(
    options.shared,
    (item, key) => {
      if (typeof item !== 'string')
        throw new Error('Unexpected array in shared');
      /** @type {SharedConfig} */
      const config =
        item === key || !isRequiredVersion(item)
          ? {
              import: item,
            }
          : {
              import: key,
              requiredVersion: item,
            };
      return config;
    },
    (item) => item
  );
  return sharedOptions.reduce((acc, [key, options]) => {
    acc[key] = {
      import: options.import,
      shareKey: options.shareKey || key,
      shareScope: options.shareScope,
      requiredVersion: options.requiredVersion,
      strictVersion: options.strictVersion,
      singleton: options.singleton,
      packageName: options.packageName,
      eager: options.eager,
    };
    return acc;
  }, {});
};

export const internalizeSharedPackages = (options, compiler) => {
  //TODO: should use this util for other areas where we read MF options from userland
  if (!options.shared) {
    return;
  }
  const sharedOptions = parseShareOptions(options);
  // get share keys from user, filter out ones that need to be external
  const internalizableKeys = Object.keys(sharedOptions).filter((key) => {
    if (!DEFAULT_SHARE_SCOPE[key]) {
      return true;
    }
    if (!DEFAULT_SHARE_SCOPE[sharedOptions[key].import]) {
      return true;
    }
  });
  // take original externals regex
  const backupExternals = compiler.options.externals[0];
  // if externals is a function (like when you're not running in serverless mode or creating a single build)
  if (typeof backupExternals === 'function') {
    // replace externals function with short-circuit, or fall back to original algo
    compiler.options.externals[0] = (mod, callback) => {
      if (!internalizableKeys.some((v) => mod.request.includes(v))) {
        return backupExternals(mod, callback);
      }
      // bundle it
      return Promise.resolve();
    };
  }
};
