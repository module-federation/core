// Main entry point for the HMR Client
console.log('🚀 Webpack HMR Client Starting...');

// Import Node.js compatible modules
const axios = require('axios');
const WebSocket = require('ws');

// Import custom HMR helpers
import {
  injectInMemoryHMRRuntime,
  applyHotUpdateFromApi,
} from '../custom-hmr-helpers.js';

// Import modules that can be hot reloaded
import { AppModule } from './app.js';
import { UIComponents } from './components.js';
import { AppConfig } from './config.js';
import { StyleManager } from './styles.js';

// Initialize custom HMR runtime (simplified for Node.js)
if (typeof module !== 'undefined' && module.hot) {
  console.log('🔥 HMR runtime initialized');
} else {
  console.log('⚠️ HMR not available in this environment');
}

// Initialize application
const app = new AppModule();
const ui = new UIComponents();
const config = new AppConfig();
const styles = new StyleManager();

// Setup HMR for each module
if (module.hot) {
  console.log('🔥 HMR is enabled!');
  // Accept hot updates for app module
  module.hot.accept(['./app.js'], () => {
    console.log('🔄 Hot reloading app module...');
    const { AppModule: NewAppModule } = require('./app.js');
    app.update(new NewAppModule());
  });

  // Accept hot updates for UI components
  module.hot.accept(['./components.js'], () => {
    console.log('🔄 Hot reloading UI components...');
    const { UIComponents: NewUIComponents } = require('./components.js');
    ui.update(new NewUIComponents());
  });

  // Accept hot updates for configuration
  module.hot.accept(['./config.js'], () => {
    console.log('🔄 Hot reloading configuration...');
    const { AppConfig: NewAppConfig } = require('./config.js');
    config.update(new NewAppConfig());
  });

  // Accept hot updates for styles
  module.hot.accept('./styles.js', () => {
    console.log('🔄 Hot reloading styles...');
    const { StyleManager: NewStyleManager } = require('./styles.js');
    styles.update(new NewStyleManager());
  });

  // Custom HMR update checker with string-based updates
  let lastAppliedId = 0;

  const checkForUpdates = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/updates?lastAppliedId=${lastAppliedId}`,
      );
      const data = response.data;
      debugger;
      if (data.updates && data.updates.length > 0) {
        console.log('📦 New updates available:', data.updates);
        debugger;
        // Apply string-based hot updates using custom helpers
        for (const update of data.updates) {
          if (update.content && update.filename) {
            console.log(`🔄 Applying update to ${update.filename}`);
            try {
              // Apply the hot update using the new API-based helper
              await applyHotUpdateFromApi(update.filename, update.content);
              console.log(
                `✅ Successfully applied update to ${update.filename}`,
              );
              lastAppliedId = Math.max(lastAppliedId, update.id);
            } catch (updateError) {
              console.error(
                `❌ Failed to apply update to ${update.filename}:`,
                updateError,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
    }
  };

  // Check for updates every 3 seconds
  setInterval(checkForUpdates, 3000);

  // WebSocket connection for real-time notifications
  const ws = new WebSocket('ws://localhost:3001');
  ws.onopen = () => {
    console.log('🔌 WebSocket connected for real-time updates');
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'update-triggered' && data.update) {
      console.log('🔔 Real-time update notification:', data.update);

      // Apply real-time string-based update
      if (data.update.content && data.update.filename) {
        console.log(`🔄 Applying real-time update to ${data.update.filename}`);
        try {
          // Apply the hot update using the new API-based helper
          await applyHotUpdateFromApi(
            data.update.filename,
            data.update.content,
          );
          console.log(
            `✅ Successfully applied real-time update to ${data.update.filename}`,
          );
          lastAppliedId = Math.max(lastAppliedId, data.update.id);
        } catch (updateError) {
          console.error(
            `❌ Failed to apply real-time update to ${data.update.filename}:`,
            updateError,
          );
        }
      }
    }
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('🔌 WebSocket connection closed');
  };
}

// Start the application
app.start();
ui.render();
config.load();
styles.apply();

console.log('✅ Application initialized successfully!');

// Export for potential external access
export { app, ui, config, styles };
