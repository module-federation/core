// placeholder file for delegate module injection
console.log('hoist')
console.log(__webpack_modules__[require.resolveWeak('!!react?pop')])
console.log(require.resolveWeak('react'))
__webpack_share_scopes__.default = __webpack_share_scopes__.default || {
  ...__webpack_share_scopes__.default,
  'react':{
    ['0'] : {
      get: () =>()=> require('!!react?pop'),
      eager:true,
      loaded:true
    }
  },
  'react-dom':{
    ['0'] : {
      get: () =>()=> require('!!react-dom?pop'),
      eager:true,
      loaded:true
    }
  }
}
console.log('sideloading react')
__webpack_modules__[require.resolveWeak('react')] = __webpack_modules__[require.resolveWeak('!!react?pop')]
console.log('sideloading react-dom')
__webpack_modules__[require.resolveWeak('react-dom')] = __webpack_modules__[require.resolveWeak('!!react-dom?pop')]


console.log('still in hoist',__webpack_share_scopes__)
