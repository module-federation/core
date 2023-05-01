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
var chunkQueue = [];
var resport = [];
var cnn = '__APPNAME__'
var chunkLoadingGlobal = self['webpackChunk' + cnn] || [];

function asyncOperation() {
  // This is just an example; replace it with your own logic.
  return new Promise((resolve) => {
      if(__webpack_require__.S['default']) {
          resolve()
      }
      console.log('init operation completed');
      resolve(__webpack_require__.I('default', []));
  })
    .then(async (r) => {
      const libKeys = Object.keys(__webpack_require__.S.default).reverse();
      // Load 'react' and 'next' dependencies first
      for (const libKey of libKeys) {
        if (!(libKey.startsWith('react') || libKey.startsWith('next'))) continue;
        const lib = __webpack_require__.S.default[libKey];
        const versionKeys = [Object.keys(lib).reverse()[0]]
        for (const versionKey of versionKeys) {
          const version = lib[versionKey];
          if (!version.loaded) {
            // console.log('loading', libKey, versionKey, r);
           version.loaded = 1;

            await version
              .get()
              .then((f) => {
              //  console.log('loaded', libKey, versionKey, r, f());
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
        const versionKeys = [Object.keys(lib).reverse()[0]]
        for (const versionKey of versionKeys) {
        console.log(libKey, lib[versionKey],lib[versionKey].from)

          const version = lib[versionKey];
          console.log(version)
          if (!version.loaded) {
           version.loaded = 1;
            console.log('loading', libKey, versionKey, r);
            await version
              .get()
              .then((f) => {
                console.log('loaded', libKey, versionKey, r);
                version.get = () => f;
                version.loaded = 1;
              });
          }
        }
      }
    })
    .then((r) => {
      console.log('webpack is done negotiating dependency trees', cnn);
      console.log('number of entry points to inveert startup',chunkQueue.length);
      console.log('startup inversion in progress', chunkQueue);
while (chunkQueue.length > 0) {
      chunkLoadingGlobal.push(chunkQueue.shift());

  //var item = chunkQueue.shift(); // Remove and get the first item from the queue
  // console.log('calling deferred entry queue item:', item);
  // webpackJsonpCallback.apply(null, [null].concat([item]));
 // console.log('deferred push call:', item[0]);
  // webpackJsonpCallback.apply(chunkLoadingGlobal, item);
 //    webpackJsonpCallback.call(chunkLoadingGlobal,0, item);

      //      webpackJsonpCallback.apply(
      //   null,
      //   [null].concat(Array.prototype.slice.call(item))
      // );
      //
      // return webpackJsonpCallback.apply(chunkLoadingGlobal, item);
}
    });
}

chunkLoadingGlobal.forEach(function (item, index) {
  asyncOperation().then(() => {
  // console.log('forEach:', index, item);
    webpackJsonpCallback.call(null, 0, item);
    chunkLoadingGlobal.push.bind(chunkLoadingGlobal)(item);
  });
});


chunkLoadingGlobal.push = (function (originalPush) {
  return function () {

  console.log('push catcher called push:', arguments[0][0]);
  console.log('deffered queue', chunkQueue);
  console.log('deffered report', resport);
  var matchesOrStartsWith = arguments[0][0].some(function (item) {
    return resport.some(function (resportItem) {
    console.log('matcher', item, resportItem);
      return item === resportItem || item.indexOf(resportItem) === 0;
    });
  });

console.log('matchesOrStartsWith', matchesOrStartsWith);

console.log('queue push hook: currently processing', arguments[0][0]);

    if(!matchesOrStartsWith && arguments[0][0].includes('main')){
    console.log('thinks its main');
    resport = Array.prototype.concat.apply(resport, arguments[0][0]);
    return Array.prototype.push.apply(chunkQueue, arguments);

    return chunkQueue.push(arguments);
    //   return chunkQueue.push(()=>{
    // if(cnn === 'home_app'){
    //
    //   console.log('push queue main', arguments[0][0]);
    //   }
    //    return webpackJsonpCallback.apply(
    //       null,
    //       [null].concat(Array.prototype.slice.call(arguments))
    //     );
    //   })
    }
     if(!matchesOrStartsWith && arguments[0][0].some(item => item.startsWith('pages/'))){
      resport = Array.prototype.concat.apply(resport, arguments[0][0]);
    return Array.prototype.push.apply(chunkQueue, arguments);

    return chunkQueue.push(arguments);
    //   return chunkQueue.push(()=>{
    // if(cnn === 'home_app'){
    //
    //   console.log('push queue page', arguments);
    //   }
    //    return webpackJsonpCallback.apply(
    //       null,
    //       [null].concat(Array.prototype.slice.call(arguments))
    //     );
    //   })
    }
    if(cnn === 'home_app'){
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
