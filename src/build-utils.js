import {parseRemoteSyntax} from "./internal";
import {extractUrlAndGlobal} from "./utils";
import Template from 'webpack/lib/Template';

const swc = require("@swc/core");

const transformInput = (code) => {
  return swc.transformSync(code, {
    // Some options cannot be specified in .swcrc
    sourceMaps: false,
    // Input files are treated as module by default.
    isModule: false,
    // All options below can be configured via .swcrc
    jsc: {
      "loose": false,
      target: "es5",
      "externalHelpers": false,
      parser: {
        syntax: "ecmascript",
      },
      transform: {},
    },
  }).code
}


const remoteTemplate = function() {
    const index = urlAndGlobal.indexOf('@');
    if (index <= 0 || index === urlAndGlobal.length - 1) {
      throw new Error(`Invalid request "${urlAndGlobal}"`);
    }
    var remote = {url: urlAndGlobal.substring(index + 1), global: urlAndGlobal.substring(0, index)}
    return new Promise(function (resolve, reject) {
      var __webpack_error__ = new Error();
      if (typeof window[remote.global] !== 'undefined') {
        return resolve();
      }
      __webpack_require__.l(remote.url, function (event) {
        if (typeof window[remote.global] !== 'undefined') {
          return resolve();
        }

        var errorType = event && (event.type === 'load' ? 'missing' : event.type);
        var realSrc = event && event.target && event.target.src;
        __webpack_error__.message = 'Loading script failed.(' + errorType + ': ' + realSrc + ' or global var ' + remote.global + ')';
        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;
        reject(__webpack_error__);
      }, remote.global);
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


export const promiseTemplate = (remote, ...otherPromises) => {
  let promises = '';
  if (otherPromises) {
    promises = otherPromises.map((p) => {
      return Template.getFunctionContent(p)
    })
  }
  let remoteSyntax = remote
  let remoteFactory = parseRemoteSyntax
  if(remote.startsWith('function')) {
    remoteSyntax = Template.getFunctionContent(remote);
    remoteFactory = (remoteSyntax) => {
      return Template.asString([
        `${remoteSyntax}.then(function(urlAndGlobal) {`,
        Template.indent([
          Template.getFunctionContent(remoteTemplate)
        ]),
        '})'
      ])
    }
  }


  const allPromises = [
    remoteFactory(remoteSyntax),
    ...promises
  ].join(',\n')
  return Template.asString([
    'promise new Promise(function(resolve, reject) {',
    transformInput(Template.indent([
      'Promise.all([',
      Template.indent(allPromises),
      ']).then(function(promises) {',
      Template.indent([
        'resolve(promises[0]);',
      ]),
      '})',
    ])),
    '})',
  ])
}
export const promiseFactory = (factory) => {

  const wrapper = `new Promise(${factory.toString()})`

  if (wrapper.includes('require(', 'import(', 'import ')) {
    throw new Error('promiseFactory does not support require, import, or import statements');
  }

  const template = Template.asString([
    'function() {',
    Template.indent([
      wrapper
    ]),
    '}',
  ]);


  return template

}
