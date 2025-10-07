const { URL } = require('url');

module.exports = {
  findBundle: function (i, options) {
    // Test both builds
    return i === 0 ? './main.js' : './module/main.mjs';
  },
  moduleScope(scope) {
    // Add URL to scope for Node.js targets
    // Node.js has URL as a global since v10.0.0
    scope.URL = URL;
  },
};
