// Analytics Entry Point - Data processing and reporting
const Logger = require('./utils/logger');
const DataManager = require('./utils/dataManager');
const Metrics = require('./utils/metrics');
const DataVisualization = require('./components/dataVisualization');

// Analytics state
let analyticsState = {
  isInitialized: false,
  isProcessing: false,
  stopped: false,
  totalEvents: 0,
  processedBatches: 0,
  startTime: null,
  lastProcessingTime: null,
  errors: [],
  processingInterval: null,
};

// Initialize analytics components
const logger = new Logger('ANALYTICS');
const dataManager = new DataManager();
const metrics = new Metrics();
const eventChart = new DataVisualization('event-timeline');
const reportChart = new DataVisualization('analytics-report');

// Sample event types for analytics
const EVENT_TYPES = [
  'user_login',
  'user_logout',
  'page_view',
  'button_click',
  'form_submit',
  'api_call',
  'error_occurred',
  'feature_used',
];

function initializeAnalytics() {
  logger.info('🔬 Initializing Analytics Engine...');
  metrics.startTimer('analytics_init');

  analyticsState.startTime = new Date().toISOString();

  // Setup data storage
  dataManager.set('events', []);
  dataManager.set('user_sessions', new Map());
  dataManager.set('feature_usage', new Map());
  dataManager.set('error_logs', []);
  dataManager.set('performance_metrics', []);

  // Setup event processing
  setupEventProcessing();

  // Setup visualizations
  setupAnalyticsVisualizations();

  // Generate initial sample data
  generateSampleEvents(50);

  const initTime = metrics.endTimer('analytics_init');
  logger.info(`✅ Analytics initialized in ${initTime}ms`);
  metrics.incrementCounter('analytics_initializations');
}

function setupEventProcessing() {
  logger.info('⚙️ Setting up event processing...');

  // Subscribe to events for real-time processing
  dataManager.subscribe('events', (events) => {
    if (Array.isArray(events) && events.length > 0) {
      processEventBatch(events.slice(-10)); // Process last 10 events
    }
  });

  // Setup periodic batch processing
  const processingInterval = setInterval(() => {
    if (!analyticsState.isProcessing && !analyticsState.stopped) {
      processPendingEvents();
    }
  }, 5000); // Every 5 seconds

  // Store interval ID for cleanup
  analyticsState.processingInterval = processingInterval;
}

function setupAnalyticsVisualizations() {
  logger.info('📊 Setting up analytics visualizations...');

  // Event timeline chart
  eventChart
    .setConfig('width', 1000)
    .setConfig('height', 300)
    .setConfig('backgroundColor', '#f8f9fa')
    .addDataset('events_per_hour', [], {
      color: '#28a745',
      label: 'Events per Hour',
      type: 'line',
    })
    .addDataset('unique_users', [], {
      color: '#007bff',
      label: 'Unique Users',
      type: 'bar',
    });

  // Analytics report chart
  reportChart
    .setConfig('width', 800)
    .setConfig('height', 400)
    .addDataset('feature_usage', [], {
      color: '#ffc107',
      label: 'Feature Usage',
      type: 'pie',
    })
    .addDataset('error_distribution', [], {
      color: '#dc3545',
      label: 'Error Distribution',
      type: 'doughnut',
    });
}

function generateSampleEvents(count) {
  logger.info(`📝 Generating ${count} sample events...`);

  const events = dataManager.get('events') || [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const event = {
      id: `evt_${now}_${i}`,
      type: EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)],
      userId: `user_${Math.floor(Math.random() * 100)}`,
      sessionId: `session_${Math.floor(Math.random() * 20)}`,
      timestamp: new Date(now - Math.random() * 86400000).toISOString(), // Last 24 hours
      data: {
        page: `/page${Math.floor(Math.random() * 10)}`,
        duration: Math.floor(Math.random() * 5000),
        success: Math.random() > 0.1, // 90% success rate
      },
    };

    events.push(event);
  }

  dataManager.set('events', events);
  analyticsState.totalEvents += count;
  metrics.incrementCounter('events_generated', count);

  logger.info(
    `Generated ${count} events. Total: ${analyticsState.totalEvents}`,
  );
}

function processEventBatch(events) {
  if (!Array.isArray(events) || events.length === 0) return;

  logger.info(`🔄 Processing batch of ${events.length} events...`);
  metrics.startTimer('batch_processing');

  analyticsState.isProcessing = true;

  try {
    // Process user sessions
    const sessions = dataManager.get('user_sessions') || new Map();
    const featureUsage = dataManager.get('feature_usage') || new Map();
    const errorLogs = dataManager.get('error_logs') || [];

    events.forEach((event) => {
      // Track user sessions
      if (!sessions.has(event.userId)) {
        sessions.set(event.userId, {
          userId: event.userId,
          firstSeen: event.timestamp,
          lastSeen: event.timestamp,
          eventCount: 0,
          sessionIds: new Set(),
        });
      }

      const userSession = sessions.get(event.userId);
      userSession.lastSeen = event.timestamp;
      userSession.eventCount++;
      userSession.sessionIds.add(event.sessionId);

      // Track feature usage
      const featureKey = event.type;
      featureUsage.set(featureKey, (featureUsage.get(featureKey) || 0) + 1);

      // Track errors
      if (!event.data.success) {
        errorLogs.push({
          eventId: event.id,
          type: event.type,
          userId: event.userId,
          timestamp: event.timestamp,
          error: 'Processing failed',
        });
      }

      // Update metrics
      metrics.incrementCounter(`event_${event.type}`);
    });

    // Save processed data
    dataManager.set('user_sessions', sessions);
    dataManager.set('feature_usage', featureUsage);
    dataManager.set('error_logs', errorLogs);

    // Update visualizations
    updateAnalyticsVisualizations();

    analyticsState.processedBatches++;
    analyticsState.lastProcessingTime = new Date().toISOString();

    const processingTime = metrics.endTimer('batch_processing');
    logger.info(`✅ Processed ${events.length} events in ${processingTime}ms`);
    metrics.incrementCounter('batches_processed');
  } catch (error) {
    logger.error(`❌ Error processing batch: ${error.message}`);
    analyticsState.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      batchSize: events.length,
    });
    metrics.incrementCounter('processing_errors');
  } finally {
    analyticsState.isProcessing = false;
  }
}

function processPendingEvents() {
  const events = dataManager.get('events') || [];
  if (events.length === 0) return;

  // Process in batches of 20
  const batchSize = 20;
  const batch = events.slice(-batchSize);

  if (batch.length > 0) {
    processEventBatch(batch);
  }
}

function updateAnalyticsVisualizations() {
  // Update event timeline
  const events = dataManager.get('events') || [];
  const hourlyData = aggregateEventsByHour(events);
  const uniqueUsersData = aggregateUniqueUsersByHour(events);

  eventChart
    .updateDataset('events_per_hour', hourlyData)
    .updateDataset('unique_users', uniqueUsersData);

  // Update feature usage chart
  const featureUsage = dataManager.get('feature_usage') || new Map();
  const featureData = Array.from(featureUsage.entries()).map(
    ([feature, count]) => ({
      x: feature,
      y: count,
      label: `${feature}: ${count}`,
    }),
  );

  reportChart.updateDataset('feature_usage', featureData);

  // Update error distribution
  const errorLogs = dataManager.get('error_logs') || [];
  const errorDistribution = aggregateErrorsByType(errorLogs);

  reportChart.updateDataset('error_distribution', errorDistribution);
}

function aggregateEventsByHour(events) {
  const hourlyCount = new Map();

  events.forEach((event) => {
    const hour = new Date(event.timestamp).getHours();
    hourlyCount.set(hour, (hourlyCount.get(hour) || 0) + 1);
  });

  return Array.from(hourlyCount.entries()).map(([hour, count]) => ({
    x: hour,
    y: count,
    label: `${hour}:00`,
  }));
}

function aggregateUniqueUsersByHour(events) {
  const hourlyUsers = new Map();

  events.forEach((event) => {
    const hour = new Date(event.timestamp).getHours();
    if (!hourlyUsers.has(hour)) {
      hourlyUsers.set(hour, new Set());
    }
    hourlyUsers.get(hour).add(event.userId);
  });

  return Array.from(hourlyUsers.entries()).map(([hour, users]) => ({
    x: hour,
    y: users.size,
    label: `${hour}:00`,
  }));
}

function aggregateErrorsByType(errorLogs) {
  const errorCount = new Map();

  errorLogs.forEach((error) => {
    errorCount.set(error.type, (errorCount.get(error.type) || 0) + 1);
  });

  return Array.from(errorCount.entries()).map(([type, count]) => ({
    x: type,
    y: count,
    label: `${type}: ${count}`,
  }));
}

function generateAnalyticsReport() {
  logger.info('📋 Generating analytics report...');
  metrics.startTimer('report_generation');

  const events = dataManager.get('events') || [];
  const sessions = dataManager.get('user_sessions') || new Map();
  const featureUsage = dataManager.get('feature_usage') || new Map();
  const errorLogs = dataManager.get('error_logs') || [];

  const report = {
    summary: {
      totalEvents: events.length,
      uniqueUsers: sessions.size,
      totalSessions: Array.from(sessions.values()).reduce(
        (sum, user) => sum + user.sessionIds.size,
        0,
      ),
      errorRate:
        events.length > 0
          ? ((errorLogs.length / events.length) * 100).toFixed(2)
          : 0,
      processedBatches: analyticsState.processedBatches,
    },
    topFeatures: Array.from(featureUsage.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count })),
    recentErrors: errorLogs.slice(-5),
    performance: metrics.getReport(),
    timeRange: {
      start: analyticsState.startTime,
      end: new Date().toISOString(),
    },
  };

  const reportTime = metrics.endTimer('report_generation');
  logger.info(`📊 Report generated in ${reportTime}ms`);
  metrics.incrementCounter('reports_generated');

  return report;
}

function renderAnalytics() {
  logger.info('🖼️  Rendering analytics...');

  const report = generateAnalyticsReport();
  const eventChartOutput = eventChart.render();
  const reportChartOutput = reportChart.render();

  console.log('\n' + '='.repeat(80));
  console.log('🔬 ANALYTICS REPORT');
  console.log('='.repeat(80));
  console.log(`📊 Total Events: ${report.summary.totalEvents}`);
  console.log(`👥 Unique Users: ${report.summary.uniqueUsers}`);
  console.log(`🔗 Total Sessions: ${report.summary.totalSessions}`);
  console.log(`❌ Error Rate: ${report.summary.errorRate}%`);
  console.log(`📦 Processed Batches: ${report.summary.processedBatches}`);
  console.log('\n🏆 Top Features:');
  report.topFeatures.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.feature}: ${item.count} uses`);
  });
  console.log('='.repeat(80));

  return {
    report,
    eventChart: eventChartOutput,
    reportChart: reportChartOutput,
  };
}

// Initialize analytics
initializeAnalytics();

// Demo sequence
let demoStep = 0;
function runAnalyticsDemo() {
  demoStep++;

  switch (demoStep) {
    case 1:
      logger.info('📋 Step 1: Initial analytics render');
      renderAnalytics();
      break;

    case 2:
      logger.info('📝 Step 2: Generate more events and process');
      generateSampleEvents(25);
      processPendingEvents();
      renderAnalytics();
      break;

    case 3:
      logger.info('🔄 Step 3: Analytics demo completed');
      renderAnalytics();
      // Stop periodic processing when demo completes
      analyticsState.stopped = true;
      if (analyticsState.processingInterval) {
        clearInterval(analyticsState.processingInterval);
        analyticsState.processingInterval = null;
      }
      return;

    default:
      logger.info('✅ Analytics demo completed!');
      renderAnalytics();
      // Stop periodic processing when demo completes
      analyticsState.stopped = true;
      if (analyticsState.processingInterval) {
        clearInterval(analyticsState.processingInterval);
        analyticsState.processingInterval = null;
      }
      return;
  }

  if (demoStep < 3) {
    setTimeout(runAnalyticsDemo, 4000);
  }
}

// Analytics demo will be controlled by main demo
// logger.info('🚀 Starting Analytics Demo...');
// setTimeout(runAnalyticsDemo, 2000);

function stopAnalytics() {
  logger.info('🛑 Stopping analytics processing...');
  analyticsState.stopped = true;
  if (analyticsState.processingInterval) {
    clearInterval(analyticsState.processingInterval);
    analyticsState.processingInterval = null;
  }
}

module.exports = {
  initializeAnalytics,
  generateSampleEvents,
  processEventBatch,
  generateAnalyticsReport,
  renderAnalytics,
  runAnalyticsDemo,
  stopAnalytics,
};
