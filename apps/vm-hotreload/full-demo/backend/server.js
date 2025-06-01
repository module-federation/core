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
let lastUpdateId = 0;

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
  const lastAppliedId = parseInt(req.query.lastAppliedId) || 0;

  const pendingUpdatesRaw = updateHistory.filter(
    (update) => update.id > lastAppliedId && update.triggered,
  );

  const formattedUpdates = pendingUpdatesRaw.map((update) => {
    // Extract module path from content - this is a simplified example
    // A more robust solution would parse the JS content or have this info stored
    // const modulePathMatch = update.content.match(
    //   /\*!\*\*\* (\.\/src\/[^\s]+) \*\*\*!/,
    // );
    // const modulePath = modulePathMatch ? modulePathMatch[1] : update.filename; // Fallback to filename

    return {
      manifest: {
        c: ['index'], // Assuming 'index' is the main chunk for all these updates
        r: [], // Removed chunks, empty for now
        m: [
          // modulePath
        ], // Modules affected by this update
      },
      script: update.content,
      // Keep original update info for reference if needed by client
      originalUpdateInfo: {
        id: update.id,
        updateId: update.updateId,
        filename: update.filename,
        description: update.description,
        triggered: update.triggered,
        timestamp: update.timestamp,
      },
    };
  });

  res.json({
    updates: formattedUpdates,
    lastUpdateId: Math.max(...updateHistory.map((u) => u.id), 0),
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

  const triggeredUpdate = {
    id: ++lastUpdateId,
    updateId: updateId,
    filename: update.filename,
    description: description || update.description,
    content: update.content,
    triggered: true,
    timestamp: Date.now(),
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
  const testUpdate = {
    id: ++lastUpdateId,
    updateId: 'basic-debugger-test',
    filename: 'basic-debugger-test.hot-update.js',
    description: description,
    content: `/** Basic Debugger Test Update */
exports.id = 'main';
exports.ids = ['something'];
exports.modules = {};
exports.runtime = /******/ function (__webpack_require__) {
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'basic-debugger-test';
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
    lastUpdateId: lastUpdateId,
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
