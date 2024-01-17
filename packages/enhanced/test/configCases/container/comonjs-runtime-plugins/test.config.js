module.exports = {
  findBundle: function (i, options) {
    return i === 0 ? './main.js' : './provider/main.js';
  },
};
