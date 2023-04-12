if(typeof window !== 'undefined') {
  console.log(__webpack_get_script_filename__('home_app_single'))
  window.home_app = __webpack_chunk_load__('home_app_single')
} else if(!__webpack_share_scopes__?.default?.['react']) {
  // require('@module-federation/nextjs-mf/src/internal-delegate-hoist');
}
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
