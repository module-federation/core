// var chunkQueue = [];
// var resport = [];
// var cnn = 'home_app';
// var chunkLoadingGlobal = self['webpackChunk' + cnn] || [];
// var preferredModules = [
//   'react',
//   'react/jsx-runtime',
//   'react/jsx-dev-runtime',
//   'react-dom',
//   'next/dynamic',
//   'styled-jsx',
//   'styled-jsx/style',
//   'next/link',
//   'next/router',
//   'next/script',
//   'next/head',
// ];
// var asyncQueue = [];
// var initialConsumes = [
//   ['next/dynamic', '13.3.1'],
//   ['react/jsx-dev-runtime', '18.2.0'],
//   ['styled-jsx/style', '5.1.1'],
//   ['react', '18.2.0'],
//   ['antd', '4.24.9'],
//   ['next/router', '13.3.1'],
//   ['react-dom', '18.2.0'],
//   ['next/head', '13.3.1'],
//   ['next/link', '13.3.1'],
// ];

//**/ 		var get = function(entry) {
// /******/ 			entry.loaded = 1;
// /******/ 			return entry.get()
// /******/ 		};
// /******/ 		var init = function(fn) { return function(scopeName, a, b, c) {
// /******/ 			var promise = __webpack_require__.I(scopeName);
// /******/ 			if (promise && promise.then) return promise.then(fn.bind(fn, scopeName, __webpack_require__.S[scopeName], a, b, c));
// /******/ 			return fn(scopeName, __webpack_require__.S[scopeName], a, b, c);
// /******/ 		}; };
// /******/
// /******/ 		var load = /*#__PURE__*/ init(function(scopeName, scope, key) {
// /******/ 			ensureExistence(scopeName, key);
// /******/ 			return get(findVersion(scope, key));
// /******/ 		});

export default `
var chunkQueue = [];
var resport = [];
var preferredModules = new Set([
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'next/dynamic',
  'styled-jsx',
  'styled-jsx/style',
  'next/link',
  'next/router',
  'next/script',
  'next/head',
]);
var initialConsumes = [
  ['react/jsx-dev-runtime', '18.2.0'],
  ['styled-jsx/style', '5.1.1'],
  ['next/dynamic', '13.3.1'],
  ['antd', '4.24.9'],
  ['next/router', '13.3.1'],
  ['next/head', '13.3.1'],
  ['next/link', '13.3.1'],
];
var asyncQueue = [];
function setEagerLoading(libraryName, version, fromValue) {
  var shareScopeMap = __webpack_require__.S.default;
  var library = shareScopeMap[libraryName];
  if (!library) return;
  var alternativeVersion = Object.keys(library)[0];
  var pickedVersion = library[version] || library[alternativeVersion];
  if (
    pickedVersion &&
    pickedVersion.from === fromValue &&
    preferredModules.has(libraryName)
  ) {
    pickedVersion.eager = true;
  }
}

function loadDependencies(libKeys, cnn) {
  libKeys.forEach(function(libKey) {
   var shareScopeMap = __webpack_require__.S.default;
    var shareKey = libKey[0];
    var shareVersion = libKey[1];
    var library = shareScopeMap[shareKey];
    if (!library) return;
    var alternativeVersion = Object.keys(library)[0];
    var lib =
      preferredModules.has(shareKey) && library[shareVersion]
        ? library[shareVersion]
        : library[alternativeVersion];
        console.log('loading',libKey, cnn);
    if (!lib.loaded) {
        lib.eager = 1;
          lib.loaded = 1;

      const thennable = Promise.resolve(lib.get());
      asyncQueue.push(
        thennable.then(function(f) {
          lib.get = function() {
            return f;
          };
          lib.loaded = 1;
          lib.eager = 1;
        })
      );
    }
  });
  return Promise.all(asyncQueue);
}

function shouldDeferLoading(args) {
if (resportSet.size === 0 || chunkQueue.length === 0) return true;
  var matchesOrStartsWith = args[0].some(function (item) {
    return resport.some(function (resportItem) {
      return item === resportItem || item.indexOf(resportItem) === 0;
    });
  });
  console.log('shouldDeferLoading', !matchesOrStartsWith, args[0], resport);
  return !matchesOrStartsWith;
}
const fname = __filename.split('/server/')[1];
global.exportCounter = global.exportCounter || {};
global.exportCounter[fname] = global.exportCounter[fname] || 0;
global.exportCounter[fname]++;
console.log('exportCounter', global.exportCounter);
global.webpackShareScope = global.webpackShareScope  || __webpack_require__.S;
var asyncInFlight = false;
 // console.log('PROM', prom);
 // console.log('pro', prom);
 // console.log(shareScopeMap);
function asyncOperation(originalPush) {
  if (global.hostInit) return global.hostInit;
   console.log('[sharing]: checking/initializing');
  global.hostInit = new Promise(function (resolve) {
    var prom = __webpack_require__.I('default', [global.webpackShareScope]);
console.log('webpackShareScope', global.webpackShareScope);
    // var prom = global.__remote_scope__[cnn].init(__webpack_require__.S.default);

    initialConsumes.forEach(function (lib) {
      setEagerLoading(lib[0], lib[1], cnn);
    // console.log('setting eager loading', lib[0], lib[1], cnn);

    });
    resolve(prom);
  })
    .then(function () {
       loadDependencies(initialConsumes, cnn);
      return Promise.all([...asyncQueue,global.__remote_scope__[cnn].get('./pages/index')])
    return global.__remote_scope__[cnn].get('./pages/index');
      console.log('init operation completed');
      loadDependencies(initialConsumes, cnn);
      console.log(asyncQueue);
      return Promise.all(asyncQueue);
    })
    .then(function () {


      console.log('webpack is done negotiating dependency trees', cnn);
      console.log(
        'number of entry points to invert startup',
        chunkQueue.length
      );
      console.log('startup inversion in progress', chunkQueue);

      console.log('after init', __webpack_require__.S);
      console.log('after init: rect get', __webpack_require__.S.default['react/jsx-dev-runtime']['18.2.0']);
      console.log('get method for dev runtime', __webpack_require__.S.default['react/jsx-dev-runtime']['18.2.0'].get())
      while (chunkQueue.length > 0) {
        const queueArgs = chunkQueue.shift();
        // console.log('pushing deffered chunk into runtime', queueArgs[0]);
        // webpackJsonpCallback.apply(
        //   null,
        //   [null].concat(Array.prototype.slice.call([queueArgs]))
        // );
        // originalPush.apply(originalPush, [queueArgs]);
      }
    });
  return global.hostInit;
}
// asyncOperation(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
// chunkLoadingGlobal.push = (function (originalPush) {
//   return function () {
//     if (!__webpack_require__.S.default) {
//       console.log(
//         '%cshare is blank: %s',
//         'color: red; font-size: 20px;',
//         !__webpack_require__.S.default
//       );
//     }
//     console.log('chunk was pushed', arguments[0][0]);
//     if (
//       arguments[0][0].includes('main') ||
//       arguments[0][0].some(function (item) {
//         return item.startsWith('pages/');
//       })
//     ) {
//       resport = Array.prototype.concat.apply(resport, arguments[0][0]);
//       var pushEvent = Array.prototype.push.apply(chunkQueue, arguments);
//       return asyncOperation(originalPush);
//     }
//     if (!__webpack_require__.S.default) {
//       asyncOperation(originalPush);
//     }
//     console.log('queue size:', chunkQueue.length);
//     console.log('pushing chunk into webpack runtime:', arguments[0][0]);
//     webpackJsonpCallback.apply(
//       null,
//       [null].concat(Array.prototype.slice.call(arguments))
//     );
//     return originalPush.apply(chunkLoadingGlobal, arguments);
//   };
// })(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
`;
