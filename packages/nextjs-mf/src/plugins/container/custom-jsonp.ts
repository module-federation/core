export default `
function promiseState(p) {
  var t = {};
  return Promise.race([p, t]).then(function (v) {
    return v === t ? "pending" : "fulfilled";
  }, function () {
    return "rejected";
  });
}
function cleanInitArrays(array) {
  array.forEach(function (item, index) {
    promiseState(item).then(function (status) {
      if (status === 'fulfilled') {
        array.splice(index, 1);
      }
    });
  });
}

function asyncOperation(originalPush) {
  return Promise.all(__webpack_require__.initConsumes).then(function(){
    return Promise.all(__webpack_require__.initRemotes)
  }).then(function () {
    for (let q in chunkQueue) {
     if(__webpack_require__.getEagerSharedForChunkId) {__webpack_require__.getEagerSharedForChunkId(chunkQueue[q][0],__webpack_require__.initConsumes)}
     if(__webpack_require__.getEagerRemotesForChunkId) {__webpack_require__.getEagerRemotesForChunkId(chunkQueue[q][0],__webpack_require__.initRemotes)}
    }

    return Promise.all([
      Promise.all((function () {
        return __webpack_require__.initConsumes;
      })()),
      Promise.all((function () {
        return __webpack_require__.initRemotes;
      })())
    ]);

  })
  .then(function () {
    function runCallback(queueArgs) {
       Promise.all(__webpack_require__.initConsumes).then(function() {
        webpackJsonpCallback.apply(null, [null].concat(Array.prototype.slice.call([queueArgs])));
        originalPush.apply(originalPush, [queueArgs]);
      });
    }

    while (chunkQueue.length > 0) {
     runCallback(chunkQueue.shift());
    }
  });
}

asyncOperation(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));

chunkLoadingGlobal.push = (function (originalPush) {
  return function () {
    var chunkID = arguments[0][0];
    if(__webpack_require__.getEagerSharedForChunkId) {__webpack_require__.getEagerSharedForChunkId(chunkID,__webpack_require__.initConsumes)}
    if(__webpack_require__.getEagerRemotesForChunkId) {__webpack_require__.getEagerRemotesForChunkId(chunkID,__webpack_require__.initRemotes)}

    __webpack_require__.O(null, ['webpack'], function () {
        if(__webpack_require__.getEagerSharedForChunkId) {__webpack_require__.getEagerSharedForChunkId(chunkID,__webpack_require__.initConsumes)}
        if(__webpack_require__.getEagerRemotesForChunkId) {__webpack_require__.getEagerRemotesForChunkId(chunkID,__webpack_require__.initRemotes)}
    },0);

    __webpack_require__.O(null, [chunkID], function () {
      if(__webpack_require__.getEagerSharedForChunkId) {__webpack_require__.getEagerSharedForChunkId(chunkID,__webpack_require__.initConsumes)}
      if(__webpack_require__.getEagerRemotesForChunkId) {__webpack_require__.getEagerRemotesForChunkId(chunkID,__webpack_require__.initRemotes)}
      cleanInitArrays(__webpack_require__.initConsumes);
      cleanInitArrays(__webpack_require__.initRemotes);
    },0);

    if (typeof arguments[0][2] === 'function') {
      chunkTracker = Array.prototype.concat.apply(chunkTracker, arguments[0][0]);
      var pushEvent = Array.prototype.push.apply(chunkQueue, arguments);
      return asyncOperation(originalPush);
    }

    webpackJsonpCallback.apply(
      null,
      [null].concat(Array.prototype.slice.call(arguments))
    );
    return originalPush.apply(chunkLoadingGlobal, arguments);
  };
})(chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
`;
