'use strict';
const logger_1 = require('../utils/logger');

let _buildAdapter = async () => {
  // TODO: add logger
  logger_1.logger.error('Please set a BuildAdapter!');
  return [];
};

function setBuildAdapter(buildAdapter) {
  _buildAdapter = buildAdapter;
}

function getBuildAdapter() {
  return _buildAdapter;
}

module.exports = {
  setBuildAdapter,
  getBuildAdapter,
};
//# sourceMappingURL=build-adapter.js.map
