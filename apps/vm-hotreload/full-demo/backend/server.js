const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 3001 });
const connectedClients = new Set();

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  console.log('Client connected. Total clients:', connectedClients.size);

  ws.on('close', () => {
    connectedClients.delete(ws);
    console.log('Client disconnected. Total clients:', connectedClients.size);
  });
});

// In-memory state
let updateHistory = [];
let availableUpdates = [];
let clientUpdateTracking = new Map(); // Track which updates each client has received

// Generate a unique webpack-style hash
function generateWebpackHash() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Load available updates from updates directory
function loadAvailableUpdates() {
  const updatesDir = path.join(__dirname, '../updates');
  if (!fs.existsSync(updatesDir)) {
    fs.mkdirSync(updatesDir, { recursive: true });
    return;
  }

  const files = fs
    .readdirSync(updatesDir)
    .filter((file) => file.endsWith('.hot-update.js'));
  availableUpdates = files.map((file) => {
    const content = fs.readFileSync(path.join(updatesDir, file), 'utf8');
    return {
      id: file.replace('.hot-update.js', ''),
      filename: file,
      description: extractDescription(content),
      content: content,
      applied: false,
    };
  });

  console.log(`Loaded ${availableUpdates.length} available updates`);
}

function extractDescription(content) {
  const match = content.match(/\/\*\*\s*([^*]+)\s*\*\//);
  return match ? match[1].trim() : 'No description available';
}

// API Routes

// Get pending updates for client
app.get('/api/updates', (req, res) => {
  const clientId = req.query.clientId || 'default';
  const currentHash = req.query.currentHash || '0';

  // Get the list of updates this client has already received
  if (!clientUpdateTracking.has(clientId)) {
    clientUpdateTracking.set(clientId, new Set());
  }
  const clientReceivedUpdates = clientUpdateTracking.get(clientId);

  // Find the latest triggered update that:
  // 1. Has a different hash than client's current hash
  // 2. Has not been sent to this client before
  const latestUpdate = updateHistory
    .filter((update) => {
      return (
        update.triggered &&
        update.webpackHash !== currentHash &&
        !clientReceivedUpdates.has(update.updateId)
      );
    })
    .slice(-1)[0]; // Get the most recent one

  let formattedUpdate = null;
  if (latestUpdate) {
    // Mark this update as sent to this client
    clientReceivedUpdates.add(latestUpdate.updateId);

    formattedUpdate = {
      manifest: {
        c: ['index'], // Assuming 'index' is the main chunk for all these updates
        r: [], // Removed chunks, empty for now
        m: [
          // modulePath
        ], // Modules affected by this update
      },
      script: latestUpdate.content,
      // Keep original update info for reference if needed by client
      originalInfo: {
        updateId: latestUpdate.updateId,
        filename: latestUpdate.filename,
        description: latestUpdate.description,
        triggered: latestUpdate.triggered,
        timestamp: latestUpdate.timestamp,
        webpackHash: latestUpdate.webpackHash,
      },
    };

    console.log(
      `Sending update ${latestUpdate.updateId} to client ${clientId} with hash ${latestUpdate.webpackHash}`,
    );
  }

  res.json({
    update: formattedUpdate, // Single update object instead of array
    serverTime: Date.now(),
  });
});

// Get all available updates for admin interface
app.get('/api/available-updates', (req, res) => {
  res.json({
    updates: availableUpdates,
    history: updateHistory.slice(-10), // Last 10 updates
  });
});

// Trigger an update
app.post('/api/trigger-update', (req, res) => {
  const { updateId, description } = req.body;

  const update = availableUpdates.find((u) => u.id === updateId);
  if (!update) {
    return res.status(404).json({ error: 'Update not found' });
  }

  // Generate a unique webpack hash for this update
  const webpackHash = generateWebpackHash();

  const triggeredUpdate = {
    updateId: updateId,
    filename: update.filename,
    description: description || update.description,
    content: update.content,
    triggered: true,
    timestamp: Date.now(),
    webpackHash: webpackHash,
  };

  updateHistory.push(triggeredUpdate);

  // Notify connected WebSocket clients
  const message = JSON.stringify({
    type: 'update-triggered',
    update: triggeredUpdate,
  });

  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log(`Update triggered: ${updateId} - ${description}`);
  res.json({ success: true, update: triggeredUpdate });
});

// Trigger basic debugger test update
app.post('/api/trigger-basic-debugger-test', (req, res) => {
  const { description = 'Basic Debugger Test Update' } = req.body;

  // Create a test update specifically for basic debugger
  // Generate a unique hash for this update to prevent continuous reloads
  const uniqueUpdateHash = `basic-debugger-test-${Date.now().toString(36)}`;

  // Generate a unique webpack hash for this update
  const webpackHash = generateWebpackHash();

  const testUpdate = {
    updateId: uniqueUpdateHash, // Use unique hash instead of fixed string
    filename: `${uniqueUpdateHash}.hot-update.js`,
    description: description,
    webpackHash: webpackHash,
    content: `/** Basic Debugger Test Update */
exports.id = 'main';
exports.ids = null;
exports.modules = {
  './src/index.js': function(module, exports, __webpack_require__) {
    console.log('🧪 Basic debugger test module loaded at:', new Date().toISOString());
    console.log('🔄 This is a test hot update for the basic debugger');

    // Test module that demonstrates HMR functionality
    const testData = {
      timestamp: Date.now(),
      message: 'Hot update applied successfully!',
      counter: Math.floor(Math.random() * 1000)
    };

    console.log('📊 Test data:', testData);
if (module.hot) {
  console.log('🔥 Debug demo has module.hot support');
  // process.exit();
  module.hot.accept();
}
    module.exports = testData;
  }
};
exports.runtime = /******/ function (__webpack_require__) {
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => '${webpackHash}';
    /******/
  })();
  /******/
};`,
    triggered: true,
    timestamp: Date.now(),
  };

  updateHistory.push(testUpdate);

  // Notify connected WebSocket clients
  const message = JSON.stringify({
    type: 'update-triggered',
    update: testUpdate,
  });

  connectedClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log(`Basic debugger test update triggered: ${description}`);
  res.json({ success: true, update: testUpdate });
});

// Get server status
app.get('/api/status', (req, res) => {
  res.json({
    connectedClients: connectedClients.size,
    availableUpdates: availableUpdates.length,
    updateHistory: updateHistory.length,
    totalUpdates: updateHistory.length,
    uptime: process.uptime(),
  });
});

// Serve admin interface
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'HMR Management Platform API',
    endpoints: {
      'GET /api/updates': 'Get pending updates for client',
      'GET /api/available-updates': 'Get all available updates',
      'POST /api/trigger-update': 'Trigger an update',
      'POST /api/trigger-basic-debugger-test':
        'Trigger basic debugger test update',
      'GET /api/status': 'Get server status',
      'GET /admin': 'Admin web interface',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HMR Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Admin interface available at http://localhost:${PORT}/admin`);
  console.log(`🔌 WebSocket server running on ws://localhost:3001`);

  loadAvailableUpdates();
});
