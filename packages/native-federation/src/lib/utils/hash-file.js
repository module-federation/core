'use strict';
const crypto = require('crypto');
const fs = require('fs');

function hashFile(fileName) {
  const fileBuffer = fs.readFileSync(fileName);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

module.exports = { hashFile };
//# sourceMappingURL=hash-file.js.map
