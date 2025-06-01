// Simple HMR Test - Basic counter increment demo

let analyticsCounter = 0;

function initializeAnalytics() {
  analyticsCounter = 0;
}

function incrementCounter() {
  analyticsCounter++;
}

function getCounter() {
  return analyticsCounter;
}

function runAnalyticsDemo() {
  initializeAnalytics();
  incrementCounter();
}

// Export functions for use in other modules
module.exports = {
  initializeAnalytics,
  incrementCounter,
  getCounter,
  runAnalyticsDemo,
};
