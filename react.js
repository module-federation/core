if (global.React) {
  console.log("loading global react");
  module.exports = global.React;
} else if (process.browser && window.React) {
  module.exports = window.React;
} else if (process.browser) {
  window.React = process.env.NODE_ENV === 'development' ? require('react/umd/react.development.js') : require("react/umd/react.production.min.js");
  module.exports = window.React;
} else {
  console.log("loading fresh react");
  var isWebpack = typeof __non_webpack_require__ === "undefined";
  global.React = isWebpack
    ? __non_webpack_require__("react")
    : require("react/cjs/react.production.min");
  module.exports = global.React;
}
