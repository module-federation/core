// __webpack_init_sharing__('default');
let containerExists =  __webpack_share_scopes__?.default?.react
console.log(containerExists);
console.log(__webpack_runtime_id__);

if(__webpack_runtime_id__ === 'webpack') {
  console.log(require.resolveWeak('react'))
}
// console.log(require(/*webpackMode:eager*/'realReact'));
module.exports = __webpack_share_scopes__.default.react['18.2.0'].get
