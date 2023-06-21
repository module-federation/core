// eslint-disable-next-line no-async-promise-executor
module.exports = new Promise(async (resolve, reject) => {
  const { importDelegatedModule } = await import(
    '@module-federation/utilities/src/utils/importDelegatedModule'
  );
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
