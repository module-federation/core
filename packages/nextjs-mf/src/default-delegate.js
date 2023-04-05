const { importDelegatedModule } = require('@module-federation/utilities');

module.exports = new Promise((resolve, reject) => {
  console.log('in default delegate', __resourceQuery)
  // eslint-disable-next-line no-undef
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
