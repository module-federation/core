// placeholder file for delegate module injection
// placeholder for module hoist injection, precursor to startup inversion

if(typeof window !== 'undefined') {
  console.log(document.currentScript.src);
  const { loadScript } =  require('@module-federation/utilities')
console.log(__webpack_require__.p)
  console.log(__webpack_get_script_filename__('home_app'))
  // const container = loadScript({
  //   global: 'home_app',
  //   // url: "http://localhost:",
  // });


  // console.log(__webpack_require__(require.resolve('home_app_single')))

}
console.log('still in hoist, share scope bound to hoist',__webpack_share_scopes__)
