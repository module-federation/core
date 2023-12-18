import { importDelegatedModule } from '@module-federation/utilities';
/* eslint-disable no-undef */
// eslint-disable-next-line no-async-promise-executor
module.exports = new Promise((resolve, reject) => {
  //eslint-disable-next-line
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');
  const [global, url] = currentRequest.split('@');

  importDelegatedModule({
    global,
    url: url + '?' + Date.now(),
  })
    .then((remote) => {
      resolve(remote);
    })
    .catch((err) => reject(err));
});
