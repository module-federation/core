/* eslint-disable no-undef */
module.exports = new Promise(async (resolve, reject) => {
  //eslint-disable-next-line
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');

  const [global, url] = currentRequest.split('@');
  const { importDelegatedModule } = await import(
    '@module-federation/utilities/src/utils/common'
  );

  importDelegatedModule({
    global,
    url: url + '?' + Date.now(),
  })
    .then(async (remote) => {
      console.log(
        __resourceQuery,
        'resolved remote from',
        __webpack_runtime_id__
      );

      resolve(remote);
    })
    .catch((err) => reject(err));
});
