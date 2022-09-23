
import Template from './Template';
import { parseRemoteSyntax, generateRemoteTemplate } from '../src/internal';
import {AsyncContainer} from "../types";

const swc = require('@swc/core');

const transformInput = (code: string) => {
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

  return code;
};

// // To satisfy Typescript.
declare const urlAndGlobal: string;
declare const remote: string;
declare const resolve: string;
//remote is defined in the template wrapper
const remoteTemplate = function() {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  var remote = {url: urlAndGlobal.substring(index + 1), global: urlAndGlobal.substring(0, index)}
  return new Promise(function (resolve, reject) {
    function resolveRemoteGlobal() {
      const asyncContainer = window[
        remoteGlobal
        ] as unknown as AsyncContainer;
      return resolve(asyncContainer);
    }

    if (typeof window[remoteGlobal] !== 'undefined') {
      return resolveRemoteGlobal();
    }

    (__webpack_require__ as any).l(
      reference.url,
      function (event: Event) {
        if (typeof window[remoteGlobal] !== 'undefined') {
          return resolveRemoteGlobal();
        }

        const errorType =
          event && (event.type === 'load' ? 'missing' : event.type);
        const realSrc =
          event && event.target && (event.target as HTMLScriptElement).src;

        __webpack_error__.message =
          'Loading script failed.\n(' +
          errorType +
          ': ' +
          realSrc +
          ' or global var ' +
          remoteGlobal +
          ')';

        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;

        reject(__webpack_error__);
      },
      remoteGlobal
    );
  }).then(function () {
    const proxy = {
      get: window[remote.global].get,
      init: function (shareScope) {
        const handler = {
          get(target, prop) {
            if (target[prop]) {
              Object.values(target[prop]).forEach(function (o) {
                if (o.from === '_N_E') {
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
          window[remote.global].init(new Proxy(shareScope, handler))
        } catch (e) {

        }
        window[remote.global].__initialized = true
      }
    }
    if (!window[remote.global].__initialized) {
      proxy.init()
    }
    return proxy
  })
}

remoteTemplate.toString()

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
        `${remoteSyntax}.then(function(remote) {`,
          Template.indent([Template.getFunctionContent(remoteTemplate)]),
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
