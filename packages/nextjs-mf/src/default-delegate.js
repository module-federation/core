module.exports = new Promise(async (resolve, reject) => {
  console.log('in default delegate', __resourceQuery);
  const { importDelegatedModule } = await import('@module-federation/utilities/src/utils/common')

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
