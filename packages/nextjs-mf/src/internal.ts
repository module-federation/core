import type { Compiler } from 'webpack';
import type {
  ModuleFederationPluginOptions,
  Shared,
  SharedConfig,
  SharedObject,
} from '@module-federation/utilities';

import path from 'path';
import { parseOptions } from 'webpack/lib/container/options';
import { isRequiredVersion } from 'webpack/lib/sharing/utils';

import { extractUrlAndGlobal } from '@module-federation/utilities';

// the share scope we attach by default
// in hosts we re-key them to prevent webpack moving the modules into their own chunks (cause eager error)
// in remote these are marked as import:false as we always expect the host to prove them
export const DEFAULT_SHARE_SCOPE: SharedObject = {
  "react/": {
    singleton: true,
    requiredVersion: false,
  },
  "react": {
    singleton: true,
    requiredVersion: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
  },
  "next/dist/shared/lib/app-router-context": {
    singleton: true,
    requiredVersion: false,
  },
  "next/navigation": {
    singleton: true,
    requiredVersion: false,
  },
  'next/': {
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
  'styled-jsx/style': {
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

// put host in-front of any shared module key, so "hostreact"
export const reKeyHostShared = (
  options: Shared = {}
): Record<string, SharedConfig> => {
  const shared = {
    ...options,
    ...DEFAULT_SHARE_SCOPE,
  } as Record<string, SharedConfig>;

  return Object.entries(shared).reduce((acc, item) => {
    const [itemKey, shareOptions] = item;

    const shareKey = 'host' + ((item as any).shareKey || itemKey);
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
  }, {} as Record<string, SharedConfig>);
};

// browser template to convert remote into promise new promise and use require.loadChunk to load the chunk
export const generateRemoteTemplate = (url: string, global: any) => {
  return `new Promise(function (resolve, reject) {
    var url = new URL(${JSON.stringify(url)});
    url.searchParams.set('t', Date.now());
    var __webpack_error__ = new Error();
    if (typeof ${global} !== 'undefined') return resolve();
    __webpack_require__.l(
      url.href,
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
      init: function(shareScope) {

        const handler = {
          get(target, prop) {
            if (target[prop]) {
              Object.values(target[prop]).forEach(function(o) {
                if(o.from === '_N_E') {
                  o.loaded = 1
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
          ${global}.init(new Proxy(shareScope, handler))
        } catch (e) {

        }
        ${global}.__initialized = true
      }
    }
    if (!${global}.__initialized) {
      proxy.init(__webpack_require__.S.default)
    }
    return proxy
  })`;
};

// shared packages must be compiled into webpack bundle, not require() pass through
export const internalizeSharedPackages = (
  options: ModuleFederationPluginOptions,
  compiler: Compiler
) => {
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

    const index = sharedOptions[key].import;

    if (index && !DEFAULT_SHARE_SCOPE[index]) {
      return true;
    }

    return false;
  });

  if (Array.isArray(compiler.options.externals)) {
    // take original externals regex
    const backupExternals = compiler.options.externals[0];
    // if externals is a function (like when you're not running in serverless mode or creating a single build)
    if (typeof backupExternals === 'function') {
      // replace externals function with short-circuit, or fall back to original algo
      compiler.options.externals[0] = (mod, callback) => {
        if (!internalizableKeys.some((v) => mod.request?.includes(v))) {
          return backupExternals(mod, callback);
        }
        // bundle it
        return Promise.resolve();
      };
    }
  }
};

export const externalizedShares: SharedObject = Object.entries(
  DEFAULT_SHARE_SCOPE
).reduce((acc, item) => {
  const [key, value] = item as [string, SharedConfig];

  acc[key] = { ...value, import: false };

  if (key === 'react/jsx-runtime') {
    delete (acc[key] as SharedConfig).import;
  }

  return acc;
}, {} as SharedObject);

// determine output base path, derives .next folder location
export const getOutputPath = (compiler: Compiler) => {
  const isServer = compiler.options.target !== 'client';
  let outputPath: string | string[] | undefined =
    compiler.options.output.path?.split(path.sep);

  const foundIndex = outputPath?.findIndex((i) => {
    return i === (isServer ? 'server' : 'static');
  });

  outputPath = outputPath
    ?.slice(0, foundIndex && foundIndex > 0 ? foundIndex : outputPath.length)
    .join(path.sep);

  return outputPath as string;
};

export const removePlugins = [
  'NextJsRequireCacheHotReloader',
  'BuildManifestPlugin',
  'WellKnownErrorsPlugin',
  'WebpackBuildEventsPlugin',
  'HotModuleReplacementPlugin',
  'NextMiniCssExtractPlugin',
  'NextFederationPlugin',
  'CopyFilePlugin',
  'ProfilingPlugin',
  'DropClientPage',
  'ReactFreshWebpackPlugin',
];

export const parseRemoteSyntax = (remote: string) => {
  if (typeof remote === 'string' && remote.includes('@')) {
    const [url, global] = extractUrlAndGlobal(remote);
    return generateRemoteTemplate(url, global);
  }

  return remote;
};

export const parseRemotes = (remotes: Record<string, any>) => {
  return Object.entries(remotes).reduce((acc, remote) => {
    if (!remote[1].startsWith('promise ') && remote[1].includes('@')) {
      acc[remote[0]] = 'promise ' + parseRemoteSyntax(remote[1]);
      return acc;
    }
    acc[remote[0]] = remote[1];
    return acc;
  }, {} as Record<string, string>);
};

const parseShareOptions = (options: ModuleFederationPluginOptions) => {
  const sharedOptions: [string, SharedConfig][] = parseOptions(
    options.shared,
    (item: string, key: string) => {
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
    (item: any) => item
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
  }, {} as Record<string, SharedConfig>);
};

export const toDisplayErrors = (err: Error[]) => {
  return err
    .map((error) => {
      let message = error.message;
      if (error.stack) {
        message += '\n' + error.stack;
      }
      return message;
    })
    .join('\n');
};
