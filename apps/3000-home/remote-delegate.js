/* eslint-disable no-undef */
// import('boot')
// Delegates are currently not used in this example, but are left here for testin
// __webpack_init_sharing__('default')

// __webpack_share_scopes__.default['react']['0'] = {
//   loaded:1,
//   eager:1,
//   get: () => require.resolveWeak('react')
// }

// __webpack_init_sharing__('default');
// __webpack_init_sharing__('other');
// console.log(__webpack_share_scopes__.default);
// __webpack_share_scopes__['default'] = {
//   react: {
//     '0': {
//       loaded: 1,
//       eager: 1,
//       get: () => require('react'),
//     }
//   },
//   'react-dom': {
//     '0': {
//       loaded: 1,
//       eager: 1,
//       get: () => require('react-dom'),
//     }
//   }
// }
// __webpack_share_scopes__['other'] = {
//   react: {
//     '0': {
//       loaded: 1,
//       eager: 1,
//       get: () => require('react'),
//     }
//   },
//   'react-dom': {
//     '0': {
//       loaded: 1,
//       eager: 1,
//       get: () => require('react-dom'),
//     }
//   }
// }

module.exports =new Promise( async (resolve, reject) => {
  // await __webpack_share_scopes__.default['realReact']['18.2.0'].get()
  // console.log(__webpack_modules__)
  console.log(require.resolveWeak('react'))
  //eslint-disable-next-line
  console.log('Delegate being called for', __resourceQuery);
  //eslint-disable-next-line
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');

  const [global, url] = currentRequest.split('@');
    console.log('got boot')
    const { importDelegatedModule } =require('@module-federation/utilities')
    //
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
