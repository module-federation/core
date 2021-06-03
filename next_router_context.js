if (global.NextRouterContext) {
  module.exports = global.NextRouterContext;
} else if (process.browser && window.NextRouterContext) {
  module.exports = window.NextRouterContext;
} else if (process.browser) {
  window.NextRouterContext = require("next/dist/next-server/lib/router-context.js");
  module.exports = window.NextRouterContext;
} else {
  var isWebpack = typeof __non_webpack_require__ === undefined;
  global.NextRouterContext = isWebpack
    ? __non_webpack_require__("next/dist/next-server/lib/router-context.js")
    : require("next/dist/next-server/lib/router-context.js");
  module.exports = global.NextRouterContext;
}
