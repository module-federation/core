// Static timestamp export for HMR testing
// This timestamp should update when the module is hot reloaded

const Logger = require('./logger');

const logger = new Logger('TIMESTAMP');

// Static export of current timestamp
const moduleLoadTime = Date.now();
const moduleLoadTimeString = new Date().toISOString();

// Function to get current load time
function getModuleLoadTime() {
  return moduleLoadTime;
}

function getModuleLoadTimeString() {
  return moduleLoadTimeString;
}

// Log when module is loaded/reloaded
logger.info(
  `📅 Timestamp module loaded at: ${moduleLoadTimeString} (${moduleLoadTime})`,
);

// Export for CommonJS
module.exports = {
  moduleLoadTime,
  moduleLoadTimeString,
  getModuleLoadTime,
  getModuleLoadTimeString,
};
