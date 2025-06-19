// Demo state that can be hot-reloaded
let demoState = {
  version: '1.0.0',
  updateCount: 0,
  features: ['hmr-client', 'polling', 'websocket'],
  startTime: new Date().toISOString(),
  lastUpdate: null,
};

// Demo business logic that can be hot-reloaded
function calculateBusinessLogic(input) {
  return {
    originalInput: input,
    processed: input * 2 + 10,
    timestamp: new Date().toISOString(),
    version: demoState.version,
  };
}

// Demo API object that can be hot-reloaded
const demoAPI = {
  greet: (name) => `Hello, ${name}! (v${demoState.version})`,
  calculate: calculateBusinessLogic,
  getStatus: () => ({
    ...demoState,
    uptime: Date.now() - new Date(demoState.startTime).getTime(),
  }),
  processData: (data) => {
    return data.map((item) => ({
      ...item,
      processed: true,
      version: demoState.version,
      updateCount: demoState.updateCount,
    }));
  },
};

// Test the demo functionality
function runDemoTests() {
  console.log('\n🧪 Running demo functionality tests...');

  try {
    // Test the API
    console.log('👋 Greeting test:', demoAPI.greet('Developer'));

    // Test calculation
    const calcResult = demoAPI.calculate(5);
    console.log('🧮 Calculation test:', calcResult);

    // Test data processing
    const testData = [
      { id: 1, name: 'Test Item 1' },
      { id: 2, name: 'Test Item 2' },
    ];
    const processedData = demoAPI.processData(testData);
    console.log('📊 Data processing test:', processedData);

    // Get status
    const status = demoAPI.getStatus();
    console.log('📊 Current status:', status);

    console.log('✅ All demo tests passed');
  } catch (error) {
    console.error('❌ Demo test failed:', error);
  }
}

// Handle module.hot if available
if (module.hot) {
  module.hot.accept(() => {
    console.log('🔄 Demo module hot reloaded!');
  });

  module.hot.dispose((data) => {
    console.log('🧹 Demo module disposing...');
    data.preserved = {
      demoState,
      startTime: demoState.startTime,
    };
  });
}

// Export for use by main application
module.exports = {
  demoState,
  demoAPI,
  runDemoTests,
  calculateBusinessLogic,
};
