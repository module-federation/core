// import {importDelegatedModule} from '@module-federation/utilities/src/utils/common';
module.exports = new Promise(async (resolve, reject) => {
  console.log('in default delegate', __resourceQuery)
  // eslint-disable-next-line no-undef
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');
  const [global, url] = currentRequest.split('@');
resolve({});
  // importDelegatedModule({
  //   global,
  //   url: url + '?' + Date.now(),
  // })
  //   .then((remote) => {
  //     resolve(remote);
  //   })
  //   .catch((err) => reject(err));
});
