exports.id = 'index';
exports.ids = null;
exports.modules = {
  /***/ './src/config.js':
    /*!************************!\
  !*** ./src/config.js ***!
  \************************/
    /***/ (module, exports) => {
      class AppConfig {
        constructor() {
          this.version = '2.0';
          this.config = {
            apiUrl: 'http://localhost:3000',
            wsUrl: 'ws://localhost:3001',
            pollingInterval: 2000,
            enableHMR: true,
            debugMode: true,
            theme: 'enhanced',
            features: {
              realTimeUpdates: true,
              autoReload: true,
              notifications: true,
              analytics: true,
              darkMode: true,
            },
          };
          console.log('⚙️ AppConfig updated to enhanced version', this.version);
        }

        load() {
          console.log('📋 Loading enhanced application configuration:');
          console.log(`  API URL: ${this.config.apiUrl}`);
          console.log(`  WebSocket URL: ${this.config.wsUrl}`);
          console.log(
            `  Polling Interval: ${this.config.pollingInterval}ms (Enhanced)`,
          );
          console.log(`  HMR Enabled: ${this.config.enableHMR}`);
          console.log(`  Debug Mode: ${this.config.debugMode}`);
          console.log(`  Theme: ${this.config.theme}`);
          console.log(`  Features:`, this.config.features);
          console.log(`  Version: ${this.version}`);
        }

        update(newConfig) {
          console.log(
            '🔄 Updating application configuration with enhanced features...',
          );
          const oldVersion = this.version;
          Object.assign(this, newConfig);
          console.log(
            `✅ Configuration updated from ${oldVersion} to ${this.version}`,
          );
          this.load();
        }

        get(key) {
          return this.config[key];
        }

        set(key, value) {
          this.config[key] = value;
          console.log(`📝 Enhanced config updated: ${key} = ${value}`);
        }

        getFeature(name) {
          return this.config.features[name] || false;
        }

        setApiUrl(url) {
          this.config.apiUrl = url;
          console.log(`📝 API URL updated: ${url}`);
        }

        setPollingInterval(interval) {
          this.config.pollingInterval = interval;
          console.log(`📝 Polling interval updated: ${interval}ms`);
        }

        setTheme(theme) {
          this.config.theme = theme;
          console.log(`📝 Theme updated: ${theme}`);
        }

        toggleFeature(featureName) {
          if (this.config.features.hasOwnProperty(featureName)) {
            this.config.features[featureName] =
              !this.config.features[featureName];
            console.log(
              `🔧 Feature '${featureName}' toggled to:`,
              this.config.features[featureName],
            );
          }
        }

        getStats() {
          return {
            version: this.version,
            theme: this.config.theme,
            enabledFeatures: Object.keys(this.config.features).filter(
              (key) => this.config.features[key],
            ),
            pollingInterval: this.config.pollingInterval,
            lastUpdated: new Date().toISOString(),
          };
        }
      }

      module.exports = { AppConfig };

      console.log('⚙️ Enhanced Config Module loaded with HMR support');

      if (true) {
        console.log('config.js hot reload has module.hot');
        // HMR self-accept for config
      }

      // Simulated edit at ' + new Date().toISOString() + '

      /***/
    },
};
exports.runtime = /******/ function (__webpack_require__) {
  // webpackRuntimeModules
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'data-update-hash';
    /******/
  })();
  /******/
  /******/
};
