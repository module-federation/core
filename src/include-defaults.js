// if(process.browser && (typeof __webpack_share_scopes__ === "undefined" || !__webpack_share_scopes__.default)) {
//   __webpack_init_sharing__('default');
// }
require('react');
require('react-dom');
require('next/link');
require('next/router');
require('next/head');
require('next/script');
require('next/dynamic');
require('styled-jsx');
if (process.env.NODE_ENV === 'development') {
  require('react/jsx-dev-runtime');
}

module.exports = {};
