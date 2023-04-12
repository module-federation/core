
if(typeof window !== 'undefined') {
  console.log(__webpack_get_script_filename__('home_app_single'))
window.home_app = __webpack_chunk_load__('home_app_single')
}
module.exports = new Promise( async (resolve, reject) => {
  const { importDelegatedModule } = await import('@module-federation/utilities/src/utils/common')
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
