export default `
function promiseState(p) {
  const t = {};
  return Promise.race([p, t]).then(v => (v === t)? "pending" : "fulfilled", () => "rejected");
}

function asyncOperation(originalPush) {
  return Promise.all(__webpack_require__.initConsumes)
    .then(function () {
      console.log('init operation completed');
        for (let q in chunkQueue) {
       __webpack_require__.getEagerSharedForChunkId(chunkQueue[q][0],__webpack_require__.initConsumes)
       __webpack_require__.getEagerRemotesForChunkId(chunkQueue[q][0],__webpack_require__.initRemotes)
      }

      return Promise.all([
      Promise.all((()=>__webpack_require__.initConsumes)()),
      Promise.all((()=>__webpack_require__.initRemotes)()),
      ]);

    })
    .then(function () {
      console.log('webpack is done negotiating dependency trees');
      console.log(
        'number of entry points to invert startup',
        chunkQueue.length
      );
      console.log('startup inversion in progress', chunkQueue);

      while (chunkQueue.length > 0) {
        const queueArgs = chunkQueue.shift();

       __webpack_require__.getEagerSharedForChunkId(queueArgs[0],__webpack_require__.initConsumes)
       __webpack_require__.getEagerRemotesForChunkId(queueArgs[0],__webpack_require__.initRemotes)

       Promise.all(__webpack_require__.initConsumes).then(function () {
        console.log('pushing deffered chunk into runtime', queueArgs[0]);
        webpackJsonpCallback.apply(
          null,
          [null].concat(Array.prototype.slice.call([queueArgs]))
        );
        originalPush.apply(originalPush, [queueArgs]);
        });
      }
    });
}

console.log('m',__webpack_require__.m);
console.log('c',__webpack_require__.c);
asyncOperation(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));

var currentChunkId = "__INSERT_CH_ID__MF__";

chunkLoadingGlobal.push = (function (originalPush) {
  return function () {
  const chunkID = arguments[0][0];
      console.log('original push', chunkID);


   chunkLoadingGlobal.forEach(function (item) {
   console.log('webpackChunkhome_app', item[0]);
   })
// __webpack_require__.O(null, [chunkID], function () {
// console.log('clearing resolved', chunkID)
//    __webpack_require__.initConsumes.forEach(function (item,index) {
//       promiseState(item).then((status)=>{
//       console.log(status)
//       if(status === 'fulfilled'){
//       __webpack_require__.initConsumes.splice(index,1)
//       }
//     })
//   })
// },2)
__webpack_require__.O(null, ['webpack'], function () {
      __webpack_require__.getEagerSharedForChunkId(chunkID,__webpack_require__.initConsumes)
__webpack_require__.getEagerRemotesForChunkId(chunkID,__webpack_require__.initRemotes)
console.log('webpack runtime loaded freom entry signal;', chunkID)
},0)
__webpack_require__.O(null, [chunkID], function () {
      __webpack_require__.getEagerSharedForChunkId(chunkID,__webpack_require__.initConsumes)
__webpack_require__.getEagerRemotesForChunkId(chunkID,__webpack_require__.initRemotes)
  console.log('init consumes', __webpack_require__.initConsumes);
},0);
    if (!__webpack_require__.S.default) {
      console.log(
        '%cshare is blank: %s',
        'color: red; font-size: 20px;',
        !__webpack_require__.S.default
      );
    }

    if (typeof arguments[0][2] === 'function') {
    console.log('queueing chunk', arguments[0][0]);
      resport = Array.prototype.concat.apply(resport, arguments[0][0]);
      var pushEvent = Array.prototype.push.apply(chunkQueue, arguments);
      return asyncOperation(originalPush);
    }
    if (!__webpack_require__.S.default) {
      asyncOperation(originalPush);
    }
    console.log('queue size:', chunkQueue.length);
    console.log('pushing chunk into webpack runtime:', arguments[0][0]);
    webpackJsonpCallback.apply(
      null,
      [null].concat(Array.prototype.slice.call(arguments))
    );
    return originalPush.apply(chunkLoadingGlobal, arguments);
  };
})(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
`;
