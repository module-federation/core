import type { Compiler } from 'webpack';
import type {
  ModuleFederationPluginOptions,
  Shared,
  SharedConfig,
  SharedObject,
} from '@module-federation/utilities';

import path from 'path';

import { isRequiredVersion } from 'webpack/lib/sharing/utils';
import { parseOptions } from 'webpack/lib/container/options';

import {
  extractUrlAndGlobal,
  createDelegatedModule,
} from '@module-federation/utilities';

// the share scope we attach by default
// in hosts we re-key them to prevent webpack moving the modules into their own chunks (cause eager error)
// in remote these are marked as import:false as we always expect the host to prove them
export const DEFAULT_SHARE_SCOPE: SharedObject = {
  react: {
    singleton: true,
    requiredVersion: false,
    import: false,
    eager:true,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
    import: false,
    eager:true,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
    eager:true,
    import: false,
  },
  'next/dynamic': {
    eager:true,
    requiredVersion: false,
    singleton: true,
    import: false
  },
  // 'styled-jsx': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: false
  // },
  // 'styled-jsx/style': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: false
  // },
  // 'next/link': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: false
  // },
  'next/router': {
    requiredVersion: false,
    singleton: true,
    import: false,
    eager:true,
  },
  // 'next/script': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: false
  // },
  // 'next/head': {
  //   requiredVersion: false,
  //   singleton: true,
  //   import: false
  // },
};

// put host in-front of any shared module key, so "hostreact"
export const reKeyHostShared = (
  options: Shared = {}
): Record<string, SharedConfig> => {
  const shared = {
    // ...options, causes multiple copies of a package to be loaded into a graph, dangerous for singletons
    ...DEFAULT_SHARE_SCOPE,
  } as Record<string, SharedConfig>;

  const reKeyedInternalModules = Object.entries(shared).reduce((acc, item) => {
    const [itemKey, shareOptions] = item;

    const shareKey = `host${(item as any).shareKey || itemKey}`;
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

  return {
    ...options, // pass through undoctored shared modules from the user config
    ...reKeyedInternalModules,
  } as Record<string, SharedConfig>;
};

// browser template to convert remote into promise new promise and use require.loadChunk to load the chunk
export const generateRemoteTemplate = (
  url: string,
  global: any
) => `new Promise(function (resolve, reject) {
    var url = new URL(${JSON.stringify(url)});
    url.searchParams.set('t', Date.now());
    var __webpack_error__ = new Error();
    if(!window.remoteLoading) {
        window.remoteLoading = {};
    };

    if(window.remoteLoading[${JSON.stringify(global)}]) {
      return resolve(window.remoteLoading[${JSON.stringify(global)}])
    }

    var res, rej;
    window.remoteLoading[${JSON.stringify(
      global
    )}] = new Promise(function(rs,rj){
      res = rs;
      rej = rj;
    })

    if (typeof window[${JSON.stringify(global)}] !== 'undefined') {
      res(window[${JSON.stringify(global)}]);
      return resolve(window[${JSON.stringify(global)}]);
    }

     __webpack_require__.l(
      url.href,
      function (event) {
        if (typeof window[${JSON.stringify(global)}] !== 'undefined') {
          res(window[${JSON.stringify(global)}]);
          return resolve(window[${JSON.stringify(global)}]);
        }
        var errorType = event && (event.type === 'load' ? 'missing' : event.type);
        var realSrc = event && event.target && event.target.src;
        __webpack_error__.message =
          'Loading script failed.\\n(' + errorType + ': ' + realSrc + ')';
        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;
        rej(__webpack_error__);
        reject(__webpack_error__);
      },
      ${JSON.stringify(global)}
    );
  }).then(function () {
    const proxy = {
      get: ${global}.get,
      init: function(shareScope, initToken) {

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
          ${global}.init(new Proxy(shareScope, handler), initToken)
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

  const foundIndex = outputPath?.lastIndexOf(isServer ? 'server' : 'static');

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
  'NextMedusaPlugin',
];

/*
 This code is checking if the remote is a string and that it includes an symbol If
 both of these conditions are met then we extract the url and global from the remote
  */
export const parseRemoteSyntax = (remote: string) => {
  if (
    typeof remote === 'string' &&
    remote.includes('@') &&
    !remote.startsWith('internal ')
  ) {
    const [url, global] = extractUrlAndGlobal(remote);
    return generateRemoteTemplate(url, global);
  }

  return remote;
};
/*
 This code is doing the following It\'s iterating over all remotes and checking if
 they are using a custom promise template or not If it\'s a custom promise template
 we\'re parsing the remote syntax to get the module name and version number
  */
export const parseRemotes = (remotes: Record<string, any>) =>
  Object.entries(remotes).reduce((acc, [key, value]) => {
    // check if user is passing a internal "delegate module" reference
    if (value.startsWith('internal ')) {
      return { ...acc, [key]: value };
    }
    // check if user is passing custom promise template
    if (!value.startsWith('promise ') && value.includes('@')) {
      return { ...acc, [key]: `promise ${parseRemoteSyntax(value)}` };
    }
    // return standard template otherwise
    return { ...acc, [key]: value };
  }, {} as Record<string, string>);

export const getDelegates = (remotes: Record<string, any>) => {
  return Object.entries(remotes).reduce((acc, [key, value]) => {
    // check if user is passing a internal "delegate module" reference
    if (value.startsWith('internal ')) {
      return { ...acc, [key]: value };
    }

    return acc;
  }, {} as Record<string, string>);
};

/*
 This code is parsing the options shared object and creating a new object with all
 of the shared configs Then it is iterating over each key in this new object and
 assigning them to an array that will be returned by this function This array contains
 objects that are used as values for the shared property of Module Federation Plugin
 Options The first thing we do here is check if the item passed into shared was a
 string or not if it\'s an array If it wasn\'t then throw an error because there should
 only be strings in there Otherwise continue on with our code below
  */
const parseShareOptions = (options: ModuleFederationPluginOptions) => {
  const sharedOptions: [string, SharedConfig][] = parseOptions(
    options.shared,
    (item: string, key: string) => {
      if (typeof item !== 'string')
        throw new Error('Unexpected array in shared');

      return item === key || !isRequiredVersion(item)
        ? {
            import: item,
          }
        : {
            import: key,
            requiredVersion: item,
          };
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

export const toDisplayErrors = (err: Error[]) =>
  err
    .map((error) => {
      let { message } = error;
      if (error.stack) {
        message += `\n${error.stack}`;
      }
      return message;
    })
    .join('\n');
