// Dashboard Entry Point - Complex demo with multiple modules
const Logger = require('./utils/logger');
const DataManager = require('./utils/dataManager');
const Metrics = require('./utils/metrics');
const UserInterface = require('./components/userInterface');
const DataVisualization = require('./components/dataVisualization');

// Dashboard state
let dashboardState = {
  isInitialized: false,
  startTime: null,
  modules: new Map(),
  activeConnections: 0,
  lastUpdate: null,
};

// Initialize dashboard components
const logger = new Logger('DASHBOARD');
const dataManager = new DataManager();
const metrics = new Metrics();
const ui = new UserInterface('MainDashboard');
const chart = new DataVisualization('dashboard-chart');
const graph = new DataVisualization('performance-graph');

function initializeDashboard() {
  if (dashboardState.isInitialized) {
    logger.warn('Dashboard already initialized');
    return;
  }

  logger.info('🚀 Initializing Dashboard...');
  metrics.startTimer('dashboard_init');

  dashboardState.isInitialized = true;
  dashboardState.startTime = new Date().toISOString();
  dashboardState.lastUpdate = new Date().toISOString();

  // Register modules
  dashboardState.modules.set('logger', logger);
  dashboardState.modules.set('dataManager', dataManager);
  dashboardState.modules.set('metrics', metrics);
  dashboardState.modules.set('ui', ui);
  dashboardState.modules.set('chart', chart);
  dashboardState.modules.set('graph', graph);

  // Setup initial data
  setupInitialData();

  // Setup UI
  setupUserInterface();

  // Setup visualizations
  setupDataVisualizations();

  const initTime = metrics.endTimer('dashboard_init');
  logger.info(`✅ Dashboard initialized in ${initTime}ms`);
  metrics.incrementCounter('dashboard_initializations');
}

function setupInitialData() {
  logger.info('📊 Setting up initial data...');

  // Add some sample data to data manager
  dataManager.set('user_count', 150);
  dataManager.set('active_sessions', 42);
  dataManager.set('server_status', 'healthy');
  dataManager.set('last_deployment', '2024-01-15T10:30:00Z');
  dataManager.set('error_rate', 0.02);

  // Subscribe to data changes
  dataManager.subscribe('user_count', (newValue, oldValue) => {
    logger.info(`User count changed: ${oldValue} → ${newValue}`);
    metrics.setGauge('current_users', newValue);
  });

  dataManager.subscribe('error_rate', (newValue) => {
    if (newValue > 0.05) {
      ui.addNotification('High error rate detected!', 'warning');
    }
  });
}

function setupUserInterface() {
  logger.info('🎨 Setting up user interface...');

  ui.setTheme('dark');
  ui.setActiveUsers(dataManager.get('user_count') || 0);
  ui.addNotification('Dashboard initialized successfully', 'success');
  ui.addNotification('All systems operational', 'info');
}

function setupDataVisualizations() {
  logger.info('📈 Setting up data visualizations...');

  // Setup main dashboard chart
  chart
    .setConfig('width', 1200)
    .setConfig('height', 400)
    .setConfig('backgroundColor', '#1a1a1a')
    .addDataset('users', generateTimeSeriesData(24, 100, 200), {
      color: '#36A2EB',
      label: 'Active Users',
      type: 'line',
    })
    .addDataset('sessions', generateTimeSeriesData(24, 20, 60), {
      color: '#FF6384',
      label: 'Sessions',
      type: 'bar',
    });

  // Setup performance graph
  graph
    .setConfig('width', 800)
    .setConfig('height', 300)
    .addDataset('response_time', generateTimeSeriesData(12, 50, 200), {
      color: '#FFCE56',
      label: 'Response Time (ms)',
      type: 'line',
    })
    .addDataset('cpu_usage', generateTimeSeriesData(12, 10, 80), {
      color: '#4BC0C0',
      label: 'CPU Usage (%)',
      type: 'area',
    });
}

function generateTimeSeriesData(points, min, max) {
  const data = [];
  const now = Date.now();

  for (let i = 0; i < points; i++) {
    data.push({
      x: new Date(now - (points - i) * 60000).toISOString(), // 1 minute intervals
      y: Math.floor(Math.random() * (max - min + 1)) + min,
      label: `T-${points - i}m`,
    });
  }

  return data;
}

function simulateActivity() {
  logger.info('🎭 Simulating dashboard activity...');

  // Simulate user activity
  const currentUsers = dataManager.get('user_count') || 0;
  const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
  const newUserCount = Math.max(0, currentUsers + change);

  dataManager.set('user_count', newUserCount);
  ui.setActiveUsers(newUserCount);

  // Update error rate
  const newErrorRate = Math.random() * 0.1; // 0-10%
  dataManager.set('error_rate', newErrorRate);

  // Add new data points to visualizations
  const newUserData = chart.datasets.get('users').data;
  newUserData.push({
    x: new Date().toISOString(),
    y: newUserCount,
    label: 'Now',
  });

  // Keep only last 24 points
  if (newUserData.length > 24) {
    newUserData.shift();
  }

  chart.updateDataset('users', newUserData);

  // Update metrics
  metrics.incrementCounter('activity_simulations');
  metrics.setGauge('current_users', newUserCount);
  metrics.setGauge('error_rate', newErrorRate);

  dashboardState.lastUpdate = new Date().toISOString();

  logger.info(
    `Activity simulated: ${newUserCount} users, ${(newErrorRate * 100).toFixed(2)}% error rate`,
  );
}

function getDashboardStatus() {
  return {
    state: dashboardState,
    modules: {
      logger: {
        logCount: logger.getLogCount(),
        createdAt: logger.getCreatedAt(),
      },
      dataManager: dataManager.getStats(),
      metrics: metrics.getReport(),
      ui: {
        name: ui.getName(),
        state: ui.getState(),
        notificationCount: ui.getNotificationCount(),
        activeUsers: ui.getActiveUsers(),
      },
      chart: {
        type: chart.getType(),
        datasetCount: chart.getDatasetCount(),
        renderCount: chart.getRenderCount(),
      },
      graph: {
        type: graph.getType(),
        datasetCount: graph.getDatasetCount(),
        renderCount: graph.getRenderCount(),
      },
    },
    timestamp: new Date().toISOString(),
  };
}

function renderDashboard() {
  logger.info('🖼️  Rendering dashboard...');
  metrics.startTimer('dashboard_render');

  const status = getDashboardStatus();
  const chartOutput = chart.render();
  const graphOutput = graph.render();
  const uiOutput = ui.render();

  const renderTime = metrics.endTimer('dashboard_render');
  metrics.incrementCounter('dashboard_renders');

  console.log('\n' + '='.repeat(80));
  console.log('📊 DASHBOARD STATUS');
  console.log('='.repeat(80));
  console.log(`🕐 Initialized: ${status.state.startTime}`);
  console.log(`🔄 Last Update: ${status.state.lastUpdate}`);
  console.log(`👥 Active Users: ${status.modules.ui.activeUsers}`);
  console.log(
    `📈 Error Rate: ${(dataManager.get('error_rate') * 100).toFixed(2)}%`,
  );
  console.log(`📊 Chart Datasets: ${status.modules.chart.datasetCount}`);
  console.log(`📈 Graph Datasets: ${status.modules.graph.datasetCount}`);
  console.log(`🔔 Notifications: ${status.modules.ui.notificationCount}`);
  console.log(`📝 Log Entries: ${status.modules.logger.logCount}`);
  console.log(`⏱️  Render Time: ${renderTime}ms`);
  console.log('='.repeat(80));

  return {
    status,
    chart: chartOutput,
    graph: graphOutput,
    ui: uiOutput,
    renderTime,
  };
}

// Initialize and start dashboard
initializeDashboard();

// Demo sequence
let demoStep = 0;
function runDashboardDemo() {
  demoStep++;

  switch (demoStep) {
    case 1:
      logger.info('📋 Step 1: Initial dashboard render');
      renderDashboard();
      break;

    case 2:
      logger.info('🎭 Step 2: Simulate user activity');
      simulateActivity();
      renderDashboard();
      break;

    case 3:
      logger.info('🔄 Step 3: Dashboard demo completed');
      renderDashboard();
      return;

    default:
      logger.info('✅ Dashboard demo completed!');
      renderDashboard();
      return;
  }

  if (demoStep < 3) {
    setTimeout(runDashboardDemo, 3000);
  }
}

logger.info('🚀 Starting Dashboard Demo...');
setTimeout(runDashboardDemo, 1000);

module.exports = {
  initializeDashboard,
  simulateActivity,
  renderDashboard,
  getDashboardStatus,
};
