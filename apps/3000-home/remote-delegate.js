/* eslint-disable no-undef */
import { importDelegatedModule } from '@module-federation/utilities';

// Delegates are currently not used in this example, but are left here for testing.
export default new Promise((resolve, reject) => {
  //eslint-disable-next-line
  console.log('Delegate being called for', __resourceQuery);
  //eslint-disable-next-line
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');

  const [global, url] = currentRequest.split('@');

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
