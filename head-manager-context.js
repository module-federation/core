if (global.HeadManagerContext) {
  module.exports = global.HeadManagerContext;
} else if (process.browser && window.HeadManagerContext) {
  consol.log('its here')
  module.exports = window.HeadManagerContext;
} else if (process.browser) {
  window.HeadManagerContext = require("next/dist/next-server/lib/head-manager-context.js");
  module.exports = window.HeadManagerContext;
} else {
  var isWebpack = typeof __non_webpack_require__ !== "undefined";
  global.HeadManagerContext = isWebpack
    ? __non_webpack_require__(
        "next/dist/next-server/lib/head-manager-context.js"
      )
    : require("next/dist/next-server/lib/head-manager-context.js");
  module.exports = global.HeadManagerContext;
}
