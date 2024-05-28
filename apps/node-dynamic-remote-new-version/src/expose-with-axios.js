const axios = require('axios');
module.exports = function () {
  return `new version :${Object.keys(axios)}`;
};
