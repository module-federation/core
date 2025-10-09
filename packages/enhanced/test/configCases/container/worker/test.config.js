const { URL } = require('url');

module.exports = {
  findBundle: function () {
    return './module/main.mjs';
  },
  moduleScope(scope) {
    // Add URL to scope for Node.js targets
    // Node.js has URL as a global since v10.0.0
    scope.URL = URL;
  },
};
