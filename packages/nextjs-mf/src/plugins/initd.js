// __webpack_init_sharing__('default');
let containerExists =  __webpack_share_scopes__?.default?.['react-dom']
console.log(containerExists);
console.log(__webpack_runtime_id__);
let moduleID = require.resolveWeak('react-dom')
module.exports = containerExists ? __webpack_share_scopes__.default['react-dom']['0'].get(): __webpack_require__(moduleID);
