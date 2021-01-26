if (global.React) {
  module.exports = global.React;
} else if (process.browser && window.React) {
  module.exports = window.React;
} else if (process.browser) {
  window.React = require("react");
  module.exports = window.React;
} else {
  global.React = require("react");
  module.exports = global.React;
}
