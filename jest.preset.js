const path = require('path');

module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|bmp|avif)$':
      path.join(__dirname, '__mocks__', 'fileMock.js'),
  },
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
};
