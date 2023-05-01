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

export default `
function asyncOperation() {
  // This is just an example; replace it with your own logic.
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('init operation completed');
      resolve(__webpack_require__.I('default', []));
    }, 1000);
  })
    .then(async (r) => {
      const libKeys = Object.keys(__webpack_require__.S.default).reverse();
      console.log(libKeys);

      // Load 'react' and 'next' dependencies first
      for (const libKey of libKeys) {
        if (!(libKey.startsWith('react') || libKey.startsWith('next'))) continue;
        const lib = __webpack_require__.S.default[libKey];
        const versionKeys = Object.keys(lib).reverse();
        for (const versionKey of versionKeys) {
          const version = lib[versionKey];
          if (!version.loaded) {
            console.log('loading', libKey, versionKey, r);
            await version
              .get()
              .then((f) => {
                console.log('loaded', libKey, versionKey, r, f());
                version.get = () => f;
                version.loaded = true;
              });
          }
        }
      }

      // Load the rest of the dependencies
      for (const libKey of libKeys) {
        if (libKey.startsWith('react') || libKey.startsWith('next')) continue;
        const lib = __webpack_require__.S.default[libKey];
        const versionKeys = Object.keys(lib).reverse();
        for (const versionKey of versionKeys) {
          const version = lib[versionKey];
          if (!version.loaded) {
            console.log('loading', libKey, versionKey, r);
            await version
              .get()
              .then((f) => {
                console.log('loaded', libKey, versionKey, r);
                version.get = () => f;
                version.loaded = true;
              });
          }
        }
      }
    })
    .then((r) => {
      console.log('done',__webpack_require__.S);
    });
}
var cnn = '__APPNAME__'
var chunkLoadingGlobal = self['webpackChunk' + cnn] || [];
chunkLoadingGlobal.forEach(function (item, index) {
  asyncOperation().then(() => {
  // console.log('forEach:', index, item);

    webpackJsonpCallback.call(null, 0, item);
  });
});

var chunkQueue = [];
var resport = [];

chunkLoadingGlobal.push = (function (originalPush) {
  return function () {
    console.log('push:', arguments[0][0]);

    if(arguments[0][0].includes('main')){
      resport.push(arguments[0][0]);
      return chunkQueue.push(()=>{
      console.log('push queue', arguments[0][0]);
       return webpackJsonpCallback.apply(
          null,
          [null].concat(Array.prototype.slice.call(arguments))
        );
      })
    }
     if(arguments[0][0].some(item => item.startsWith('pages/'))){
      resport.push(arguments[0][0]);
      return chunkQueue.push(()=>{
      console.log('push queue', arguments[0][0]);
       return webpackJsonpCallback.apply(
          null,
          [null].concat(Array.prototype.slice.call(arguments))
        );
      })
    }
    if(cnn === 'home_app'){
    console.log('arguments', arguments[0][0]);
    console.log('whole queue', chunkQueue);
    console.log('report queue', resport);
    }
    if (
      arguments[0][0].includes('main') ||
      arguments[0][0].includes('/pages')
    ) {
      console.log('running async ope', arguments[0][0]);
      asyncOperation().then(() => {
        // webpackJsonpCallback.apply(
        //   null,
        //   [null].concat(Array.prototype.slice.call(arguments))
        // );
//console.log('push call async:', arguments[0][0]);


        // return originalPush.apply(chunkLoadingGlobal, arguments);
      });
    } else {
      webpackJsonpCallback.apply(
        null,
        [null].concat(Array.prototype.slice.call(arguments))
      );
console.log('else push call:', arguments[0][0]);

      return originalPush.apply(chunkLoadingGlobal, arguments);
    }
  };
})(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
`;
