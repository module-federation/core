if (global.ReactDOM) {
  module.exports = global.ReactDOM;
} else if (process.browser && window.ReactDOM) {
  module.exports = window.ReactDOM;
} else if (process.browser) {
  window.ReactDOM = require("react-dom");
  module.exports = window.ReactDOM;
} else {
  global.ReactDOM = require("react-dom");
  module.exports = global.ReactDOM;
}
