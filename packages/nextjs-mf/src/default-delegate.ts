import { importDelegatedModule } from '@module-federation/utilities/src/utils/importDelegatedModule'

// eslint-disable-next-line no-async-promise-executor
module.exports = new Promise(async (resolve, reject) => {
  // eslint-disable-next-line no-undef
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');
  // @ts-ignore
  const [global, url] = currentRequest.split('@');
  importDelegatedModule({
    global,
    url: url + '?' + Date.now(),
  })
    // @ts-ignore
    .then((remote) => {
      resolve(remote);
    })
    // @ts-ignore
    .catch((err) => reject(err));
});
