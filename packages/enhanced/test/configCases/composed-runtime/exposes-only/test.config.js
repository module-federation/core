module.exports = {
  findBundle: (i) => (i === 1 ? './main.js' : './remote/main.js'),
};
