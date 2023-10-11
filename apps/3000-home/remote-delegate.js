import { importDelegatedModule } from '@bruno-module-federation/utilities/src/utils/importDelegatedModule';
/* eslint-disable no-undef */
// eslint-disable-next-line no-async-promise-executor
module.exports = new Promise((resolve, reject) => {
  //eslint-disable-next-line
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');
  console.log(currentRequest, 'currentRequest');
  const [global, url] = currentRequest.split('@');

  importDelegatedModule({
    global,
    url: url + '?' + Date.now(),
  })
    .then((remote) => {
      console.log(
        __resourceQuery,
        'resolved remote from',
        __webpack_runtime_id__,
      );

      resolve(remote);
    })
    .catch((err) => reject(err));
});
