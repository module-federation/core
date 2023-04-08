// placeholder file for delegate module injection
// import boot from 'bootcycle';
// console.log(__webpack_share_scopes__.default.react['0'].loaded = 1);
// console.log(__webpack_share_scopes__.default['react-dom']['0'].loaded = 1);
// console.log(__webpack_share_scopes__);
// require('react')
// require('react-dom')
console.log('hoist')
console.log(__webpack_modules__[require.resolveWeak('!!react?pop')])
console.log(require.resolveWeak('react'))
__webpack_modules__[require.resolveWeak('react')] = __webpack_modules__[require.resolveWeak('!!react?pop')]
__webpack_share_scopes__.default = __webpack_share_scopes__.default || {
  'react':{
    ['0'] : {
      get: () =>()=> require('!!react?pop'),
      eager:true,
      loaded:true
    }
  }
}
console.log('still in houst',__webpack_share_scopes__)
