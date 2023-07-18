/* eslint-disable no-undef */

// Delegates are currently not used in this example, but are left here for testing.
// eslint-disable-next-line no-async-promise-executor
module.exports = new Promise(async (resolve, reject) => {
  const { importDelegatedModule } = await import(
    '@module-federation/utilities/src/utils/pure'
  );

  //eslint-disable-next-line
  // console.log('Delegate being called for', __resourceQuery, __webpack_runtime_id__);
  //eslint-disable-next-line
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');

  const [global, url] = currentRequest.split('@');

  importDelegatedModule({
    global,
    url: url + '?' + Date.now(),
  })
    .then(async (remote) => {
      // console.log(
      //   __resourceQuery,
      //   'resolved remote from',
      //   __webpack_runtime_id__
      // );

      resolve(remote);
    })
    .catch((err) => reject(err));
});
