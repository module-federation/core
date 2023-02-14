import { importDelegatedModule } from '@module-federation/utilities';

module.exports = new Promise((resolve, reject) => {
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');

  const [global, url] = currentRequest.split('@');

  importDelegatedModule({
    global,
    url: url + '?' + Date.now(),
  })
    .then(async (remote) => {
      resolve(remote);
    })
    .catch((err) => reject(err));
});
