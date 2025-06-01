const moduleLoadTime = new Date().toISOString();

function getModuleLoadTime() {
  return moduleLoadTime;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function getTimeSinceLoad() {
  const now = new Date();
  const loadTime = new Date(moduleLoadTime);
  return now - loadTime;
}

module.exports = {
  getModuleLoadTime,
  getCurrentTimestamp,
  getTimeSinceLoad,
  moduleLoadTime,
};
