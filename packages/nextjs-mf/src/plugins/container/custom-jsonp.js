// self['webpackChunkcheckout'] = {
//   _array: self['webpackChunkcheckout'] || [],
//
//   push: function () {
//     var args = Array.prototype.slice.call(arguments);
//     console.log('push', args);
//     var self = this;
//     asyncOperation(function () {
//       Array.prototype.push.apply(self._array, args);
//     });
//   },
//
//   forEach: function (callback, thisArg) {
//     console.log('forEach', thisArg);
//     var self = this;
//     var i = 0;
//
//     function next() {
//       if (i < self._array.length) {
//         asyncOperation(function () {
//           callback.call(thisArg, self._array[i], i, self._array);
//           i++;
//           next();
//         });
//       }
//     }
//
//     next();
//   },
// };

export default //language=JS
`
var chunkQueue = [];
var resport = [];
var cnn = '__APPNAME__'
var chunkLoadingGlobal = self['webpackChunk' + cnn] || [];
var asyncQueue = [];
function setEagerLoading(libraryName, version, fromValue) {
  var library = __webpack_require__.S.default[libraryName];
  console.log('setEagerLoading',library, libraryName, version, fromValue);
library && console.log(library, library[version], library[version] && library[version].from === fromValue)
  if (library && library[version] && library[version].from === fromValue) {
  console.log('setting eager', libraryName, version, fromValue);
    library[version].eager = true;
  }
}
function loadDependencies(libKeys, cnn) {
  libKeys.forEach(function (libKey) {
    var lib = __webpack_require__.S.default[libKey];
    var versionKeys = Object.keys(lib).reverse();
    versionKeys.forEach(function (versionKey) {
      if (lib[versionKey].from !== cnn) {
        console.log('skipping', libKey, versionKey, lib[versionKey].from);
        return;
      }

      var version = lib[versionKey];
      if (!version.loaded) {
        version.loaded = 1;
        console.log('loading', libKey, versionKey);

        asyncQueue.push(version
          .get()
          .then(function (f) {
            console.log('loaded', libKey, versionKey);
            version.get = function () { return f; };
            version.loaded = 1;
          }));
      }
    });
  });
}

function shouldDeferLoading(args) {
  var matchesOrStartsWith = args[0].some(function (item) {
    return resport.some(function (resportItem) {
      console.log('item to test', item);
      return item === resportItem || item.indexOf(resportItem) === 0;
    });
  });
  return !matchesOrStartsWith;
}

function asyncOperation() {
  // This is just an example; replace it with your own logic.
  return new Promise(function (resolve) {
    console.log('init operation completed');
    var prom = __webpack_require__.I('default', []);
    Object.entries(__webpack_require__.S.default).forEach(function (lib) {
      setEagerLoading(lib[0], Object.keys(lib[1])[0], cnn);
    });
    resolve(prom);
  })
    .then(function () {
      var libKeys = Object.keys(__webpack_require__.S.default).reverse();
      var reactAndNextLibKeys = libKeys.filter(function (libKey) {
        return libKey.startsWith('react') || libKey.startsWith('next');
      });
      var otherLibKeys = libKeys.filter(function (libKey) {
        return !libKey.startsWith('react') && !libKey.startsWith('next');
      });

      loadDependencies(reactAndNextLibKeys, cnn);
      loadDependencies(otherLibKeys, cnn);

      return Promise.all(asyncQueue);
    })
    .then(function () {
      console.log('webpack is done negotiating dependency trees', cnn);
      console.log('number of entry points to invert startup', chunkQueue.length);
      console.log('startup inversion in progress', chunkQueue);

      while (chunkQueue.length > 0) {
        chunkLoadingGlobal.push(chunkQueue.shift());
      }
    });
}
var kickstart = asyncOperation()


chunkLoadingGlobal.push = (function (originalPush) {
  return function () {
    console.log('push catcher called push:', arguments[0][0]);

    if (shouldDeferLoading(arguments[0])) {
      if (arguments[0][0].includes('main') || arguments[0][0].some(function (item) { return item.startsWith('pages/'); })) {
        console.log('thinks its main or starts with pages/');
        resport = Array.prototype.concat.apply(resport, arguments[0][0]);
        return Array.prototype.push.apply(chunkQueue, arguments);
      }
    }

    if (cnn === 'home_app') {
      console.log('arguments', arguments[0][0]);
      console.log('whole queue', chunkQueue);
      console.log('report queue', resport);
    }

    webpackJsonpCallback.apply(
      null,
      [null].concat(Array.prototype.slice.call(arguments))
    );
    console.log('else push call:', arguments[0][0]);

    return originalPush.apply(chunkLoadingGlobal, arguments);
  };
})(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
`;
