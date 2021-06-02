if (global.ReactDOM) {
  console.log("loading global ReactDOM");
  module.exports = global.ReactDOM;
} else if (process.browser && window.ReactDOM) {
  module.exports = window.ReactDOM;
} else if (process.browser) {
  window.ReactDOM = process.env.NODE_ENV === 'development' ? require('react-dom/umd/react-dom.development.js') : require("react-dom/umd/react-dom.production.min.js");
  module.exports = window.ReactDOM;
} else {
  console.log("loading fresh react-dom");
  var isWebpack = typeof __non_webpack_require__ !== "undefined";
  global.ReactDOM = isWebpack
    ? __non_webpack_require__("react-dom/server.js")
    : require("react-dom/server.js");
  module.exports = global.ReactDOM;
}
