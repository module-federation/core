# HMR Full Demo

A complete Hot Module Replacement (HMR) demonstration system with a backend API server and a webpack-built Node.js client that polls for hot updates.

## Architecture

- **Backend**: Express.js API server that manages hot updates and provides admin GUI
- **Client**: Webpack-built Node.js application that polls the backend for updates
- **Updates**: Directory containing hot update files

## Components

### Backend (`/backend`)
- Express.js server running on port 3000
- WebSocket server on port 3001 for real-time notifications
- Admin web interface at `http://localhost:3000/admin`
- API endpoints for managing and triggering updates

### Client (`/client`)
- Webpack-built Node.js application
- Uses custom HMR helpers for string-based hot updates
- Polls backend every 3 seconds for new updates
- WebSocket connection for real-time update notifications
- Modular architecture with hot-reloadable components

### Updates (`/updates`)
- Directory containing `.hot-update.js` files
- Each file represents a hot update that can be applied to the client

## Getting Started

### 1. Start the Backend
```bash
# Using pnpm filter (recommended)
pnpm --filter hmr-backend start

# Or using the convenience script
pnpm run start:backend
```

The backend will be available at:
- API: `http://localhost:3000`
- Admin Interface: `http://localhost:3000/admin`
- WebSocket: `ws://localhost:3001`

### 2. Build and Run the Client
```bash
# Using pnpm filter (recommended)
pnpm --filter hmr-client-demo start

# Or using the convenience script
pnpm run start:client
```

This will:
1. Build the webpack application to `dist/index.js`
2. Start the client which will begin polling the backend

### 3. Trigger Updates

#### Via Admin Interface
1. Open `http://localhost:3000/admin` in your browser
2. View available updates
3. Trigger updates by clicking the trigger buttons

#### Via API
```bash
curl -X POST http://localhost:3000/api/trigger-update \
  -H "Content-Type: application/json" \
  -d '{"updateId": "your-update-id", "description": "Test update"}'
```

## Client Architecture

The client is built with webpack and consists of several hot-reloadable modules:

- **`src/index.js`**: Main entry point with HMR setup
- **`src/app.js`**: Core application module
- **`src/components.js`**: UI components module
- **`src/config.js`**: Configuration module
- **`src/styles.js`**: Style management module
- **`custom-hmr-helpers.js`**: Custom HMR runtime helpers (in client root directory)

## API Endpoints

- `GET /api/updates?lastAppliedId=<id>`: Get pending updates for client
- `GET /api/available-updates`: Get all available updates
- `POST /api/trigger-update`: Trigger an update
- `GET /api/status`: Get server status

## WebSocket Events

- `update-triggered`: Sent when an update is triggered via the API

## Development

### Client Development Mode
```bash
# Using pnpm filter (recommended)
pnpm --filter hmr-client-demo dev  # Builds in watch mode

# Or using the convenience script
pnpm run dev:client
```

### Adding New Updates
1. Create a new `.hot-update.js` file in the `/updates` directory
2. The file should contain the updated module code
3. Add a description comment at the top: `/** Your description here */`
4. Restart the backend to load the new update

## Features

- ✅ Webpack-built Node.js client
- ✅ API polling for updates (every 3 seconds)
- ✅ Real-time WebSocket notifications
- ✅ String-based hot updates using custom helpers
- ✅ Modular client architecture
- ✅ Admin web interface
- ✅ Update history tracking
- ✅ Multiple hot-reloadable modules

## Troubleshooting

### Client Not Receiving Updates
1. Ensure the backend is running on port 3000
2. Check that updates exist in the `/updates` directory
3. Verify the client is polling (check console logs)
4. Ensure WebSocket connection is established

### Build Issues
1. Run `pnpm install --recursive` to install all dependencies
2. Ensure Node.js version compatibility
3. Check for any missing dependencies
4. Use `pnpm --filter <package-name> <command>` for targeted operations

### WebSocket Connection Issues
1. Ensure port 3001 is not blocked
2. Check firewall settings
3. Verify WebSocket server is running (check backend logs)

## 📁 Project Structure

```
full-demo/
├── package.json                 # Main project configuration
├── README.md                    # This file
├── backend/                     # HMR Backend API Server
│   ├── package.json
│   ├── server.js               # Express.js server
│   └── public/
│       └── admin.html          # Web admin interface
├── client/                      # HMR Client Application
│   ├── package.json
│   └── index.js                # Polling client
└── updates/                     # Hot Update Chunks
    ├── module-update.hot-update.js
    ├── component-update.hot-update.js
    ├── data-update.hot-update.js
    └── style-update.hot-update.js
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- pnpm (recommended package manager)
- This project uses pnpm workspaces for efficient dependency management

> 📖 **For detailed pnpm workspace usage, see [PNPM_WORKSPACE.md](./PNPM_WORKSPACE.md)**

### Installation

1. **Install dependencies for all components using pnpm workspace:**
   ```bash
   cd /Users/bytedance/dev/universe/apps/vm-hotreload/full-demo
   pnpm install --recursive
   ```
   
   Or use the convenience script:
   ```bash
   pnpm run install:all
   ```

### Running the Demo

#### Option 1: Run Everything (Recommended)
```bash
# From the full-demo directory
   npm run demo
```

#### Option 2: Run Components Separately

1. **Start the Backend API Server:**
   ```bash
   pnpm run start:backend
   # or
   pnpm --filter hmr-backend start
   ```
   Server will start on `http://localhost:3000`
   WebSocket server on `ws://localhost:3001`

2. **Start the Client Application:**
   ```bash
   # In a new terminal
   pnpm run start:client
   # or
   pnpm --filter hmr-client-demo start
   ```

3. **Open the Admin Interface:**
   Open your browser and navigate to: `http://localhost:3000/admin`

## 🎮 Using the Demo

### Admin Web Interface

1. **Access the Interface:**
   - Open `http://localhost:3000/admin` in your browser
   - The interface shows real-time status, available updates, and logs

2. **Trigger Updates:**
   - Click "🚀 Trigger Update" buttons to send hot updates to connected clients
   - Monitor the live logs to see update activity
   - View update history and client connection status

### Client Application

1. **Monitor Client Logs:**
   - The client polls the backend every 3 seconds for updates
   - Watch the terminal for HMR activity and module updates
   - Client automatically applies received updates

2. **Real-time Updates:**
   - Updates triggered from the admin interface are immediately sent to clients
   - WebSocket connection provides instant notifications
   - Fallback to HTTP polling ensures reliability

## 📦 Available Hot Updates

### 1. Module Update (`module-update`)
- **Description:** Updates the main application module with new functionality
- **Changes:** Adds new features, version bump, enhanced logging
- **File:** `updates/module-update.hot-update.js`

### 2. Component Update (`component-update`)
- **Description:** Updates UI components with enhanced styling and new features
- **Changes:** Modern UI design, improved styling, interactive elements
- **File:** `updates/component-update.hot-update.js`

### 3. Data Update (`data-update`)
- **Description:** Updates application configuration and data structures
- **Changes:** New config options, data models, feature flags
- **File:** `updates/data-update.hot-update.js`

### 4. Style Update (`style-update`)
- **Description:** Updates application styles and theme with dark mode support
- **Changes:** Dark theme, CSS custom properties, theme toggle
- **File:** `updates/style-update.hot-update.js`

## 🔧 API Endpoints

### Backend API (`http://localhost:3000`)

- `GET /api/updates` - Check for available updates (used by client)
- `GET /api/available-updates` - List all available updates
- `POST /api/trigger-update` - Trigger a specific update
- `GET /api/status` - Get server status and statistics
- `GET /admin` - Web admin interface
- `GET /` - API documentation

### WebSocket (`ws://localhost:3001`)

- Real-time notifications for update events
- Client connection status
- Live update broadcasting

## 🛠️ Development

### Adding New Hot Updates

1. **Create Update File:**
   ```javascript
   // updates/my-update.hot-update.js
   (function(modules) {
       const updateInfo = {
           updateId: 'my-update',
           description: 'My custom update',
           timestamp: Date.now(),
           modules: {
               './src/my-module.js': {
                   id: './src/my-module.js',
                   source: `// Your updated module code here`
               }
           }
       };
       
       if (typeof window !== 'undefined' && window.hmrApplyUpdate) {
           window.hmrApplyUpdate(updateInfo);
       }
       
       return updateInfo;
   })();
   ```

2. **Restart Backend:**
   The backend automatically scans the `updates/` directory on startup

### Customizing the Client

- Modify `client/index.js` to change polling behavior
- Add custom module handling logic
- Implement different update application strategies

### Extending the Admin Interface

- Edit `backend/public/admin.html` to add new features
- Customize styling and layout
- Add new API endpoints in `backend/server.js`

## 🔍 Monitoring and Debugging

### Logs

- **Backend Logs:** Server console shows API requests and WebSocket activity
- **Client Logs:** Client console shows polling activity and update applications
- **Admin Logs:** Web interface shows real-time activity logs

### Status Monitoring

- **Server Status:** Available at `/api/status`
- **Client Status:** Monitor client terminal output
- **Real-time Dashboard:** Use the web admin interface

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot connect to HMR backend"**
   - Ensure backend server is running on port 3000
   - Check firewall settings
   - Verify no other service is using port 3000

2. **"WebSocket connection failed"**
   - Backend WebSocket server runs on port 3001
   - Check if port 3001 is available
   - Firewall may be blocking WebSocket connections

3. **"No updates available"**
   - Ensure `.hot-update.js` files exist in `updates/` directory
   - Restart backend server to rescan update files
   - Check file permissions

4. **"Updates not applying"**
   - Check client logs for error messages
   - Verify update file syntax
   - Ensure client is connected to backend

### Debug Mode

```bash
# Run backend in debug mode
DEBUG=* npm run backend

# Run client with verbose logging
NODE_ENV=development npm run client
```

## 📚 Technical Details

### HMR Implementation

- **Polling Strategy:** Client polls backend every 3 seconds
- **WebSocket Fallback:** Real-time notifications via WebSocket
- **Update Format:** Compatible with webpack hot-update format
- **Module Registry:** Client maintains module state and hot accept callbacks

### Security Considerations

- **Local Development Only:** This demo is designed for local development
- **No Authentication:** Admin interface has no authentication
- **Code Execution:** Updates can execute arbitrary JavaScript
- **Production Use:** Not recommended for production environments

## 🤝 Contributing

This is a demonstration project. Feel free to:

- Add new update types
- Improve the admin interface
- Enhance client functionality
- Add tests and documentation

## 📄 License

MIT License - Feel free to use this code for learning and development purposes.

---

**Happy Hot Reloading! 🔥**
