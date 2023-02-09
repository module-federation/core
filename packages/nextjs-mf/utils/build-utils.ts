import Template from './Template';
import { parseRemoteSyntax } from '../src/internal';
import { WebpackRemoteContainer } from '@module-federation/utilities';
import path from 'path';

const transformInput = (code: string) => {
  let swc;
  try {
    swc = require('@swc/core');
  } catch (e) {
    return code;
  }
  return swc.transformSync(code, {
    // Some options cannot be specified in .swcrc
    sourceMaps: false,
    // Input files are treated as module by default.
    isModule: false,
    // All options below can be configured via .swcrc
    jsc: {
      loose: false,
      target: 'es5',
      externalHelpers: false,
      parser: {
        syntax: 'ecmascript',
      },
      transform: {},
    },
  }).code;
};

export const computeRemoteFilename = (isServer: boolean, filename: string) => {
  if (isServer && filename) {
    return path.basename(filename);
  }
  return filename;
};

// // To satisfy Typescript.
declare const urlAndGlobal: string;
//remote is defined in the template wrapper
const IsomorphicRemoteTemplate = function () {
  const index = urlAndGlobal.indexOf('@');

  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  var remote = {
    url: urlAndGlobal.substring(index + 1),
    global: urlAndGlobal.substring(0, index) as unknown as number, // this casting to satisfy TS
  };

  return new Promise<void>(function (resolve, reject) {
    const __webpack_error__ = new Error() as Error & {
      type: string;
      request: string | null;
    };

    if (typeof window !== 'undefined') {
      if (typeof window[remote.global] !== 'undefined') {
        return resolve();
      }
    } else {
      // @ts-ignore
      if (!global.__remote_scope__) {
        // create a global scope for container, similar to how remotes are set on window in the browser
        // @ts-ignore
        global.__remote_scope__ = {
          _config: {},
        };
      }

      // @ts-ignore
      if (typeof global.__remote_scope__[remote.global] !== 'undefined') {
        return resolve();
      }
    }

    (__webpack_require__ as any).l(
      remote.url,
      function (event: Event) {
        if (typeof window !== 'undefined') {
          if (typeof window[remote.global] !== 'undefined') {
            return resolve();
          }
        } else {
          // @ts-ignore
          if (typeof global.__remote_scope__[remote.global] !== 'undefined') {
            return resolve();
          }
        }

        var errorType =
          event && (event.type === 'load' ? 'missing' : event.type);
        var realSrc =
          event && event.target && (event.target as HTMLScriptElement).src;

        __webpack_error__.message =
          'Loading script failed.(' +
          errorType +
          ': ' +
          realSrc +
          ' or global var ' +
          remote.global +
          ')';

        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;

        reject(__webpack_error__);
      },
      remote.global
    );
  })
    .then(function () {
      const globalScope =
        //@ts-ignore
        typeof window !== 'undefined' ? window : global.__remote_scope__;
      const remoteGlobal = globalScope[
        remote.global
      ] as unknown as WebpackRemoteContainer & {
        __initialized: boolean;
      };
      const proxy: WebpackRemoteContainer = {
        get: remoteGlobal.get,
        //@ts-ignore
        init: function (shareScope) {
          const handler: ProxyHandler<typeof __webpack_share_scopes__> = {
            get(target, prop: string) {
              if (target[prop]) {
                Object.values(target[prop]).forEach(function (o) {
                  if (o.from === '_N_E') {
                    o.loaded = 1;
                  }
                });
              }
              return target[prop];
            },
            set(target, property: string, value, receiver) {
              if (target[property]) {
                return target[property] as unknown as boolean;
              }
              target[property] = value;
              return true;
            },
          };

          try {
            remoteGlobal.init(
              new Proxy(shareScope as typeof __webpack_share_scopes__, handler)
            );
          } catch (e) {}

          remoteGlobal.__initialized = true;
        },
      };

      if (!remoteGlobal.__initialized) {
        proxy.init();
      }
      return proxy;
    })
    .catch((e) => {
      console.error(remote.global, 'is offline, returning fake remote');
      console.error(e);

      return {
        fake: true,
        get: (arg: any) => {
          console.log('faking', arg, 'module on', remote.global);

          return Promise.resolve(() => {
            return () => null;
          });
        },
        init: () => {},
      };
    });
};

export const promiseFactory = (factory: string | Function) => {
  const wrapper = `new Promise(${factory.toString()})`;

  const isPromiseFactoryIncludesImportOrRequireContext = [
    'require(',
    'import(',
    'import ',
  ].some((statement) => wrapper.includes(statement));

  if (isPromiseFactoryIncludesImportOrRequireContext) {
    throw new Error(
      'promiseFactory does not support require, import, or import statements'
    );
  }

  const template = Template.asString([
    'function() {',
    Template.indent([wrapper]),
    '}',
  ]);

  return template;
};

export const promiseTemplate = (
  remote: string,
  ...otherPromises: Function[]
) => {
  let promises: string[] = [];

  if (otherPromises) {
    promises = otherPromises.map((p) => {
      return Template.getFunctionContent(
        promiseFactory(p) as unknown as Function
      );
    });
  }

  let remoteSyntax = remote;
  let remoteFactory = parseRemoteSyntax;

  if (
    typeof remote === 'function' ||
    remote.startsWith('function') ||
    remote.startsWith('(')
  ) {
    remoteSyntax = Template.getFunctionContent(
      promiseFactory(remote) as unknown as Function
    );

    remoteFactory = (remoteSyntax) => {
      return Template.asString([
        `${remoteSyntax}.then(function(urlAndGlobal) {`,
        Template.indent([
          Template.getFunctionContent(IsomorphicRemoteTemplate),
        ]),
        '})',
      ]);
    };
  }

  const allPromises = [remoteFactory(remoteSyntax), ...promises].join(',\n');

  return Template.asString([
    'promise new Promise(function(resolve, reject) {',
    transformInput(
      Template.indent([
        'Promise.all([',
        Template.indent(allPromises),
        ']).then(function(promises) {',
        Template.indent(['resolve(promises[0]);']),
        '})',
      ])
    ),
    '})',
  ]);
};

// remotes: {
//   shop: promiseTemplate('global@url', (resolve,reject) => {}),
//     shop: promiseTemplate(
//     // can also be a string if it needs to be computed in scope
//     `(resolve, reject) => {
//                 resolve("${remotes.shop}");
//               }`,
//     (resolve,reject)=>{
//       console.log('runing other promise');
//       setTimeout(() => {
//         console.log('resolving promise');
//         resolve();
//       } , 1000);
//     }),
//     checkout: remotes.checkout,
// },
