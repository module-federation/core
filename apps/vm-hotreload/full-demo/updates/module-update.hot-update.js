exports.id = 'index';
exports.ids = null;
exports.modules = {
  /***/ './src/app.js':
    /*!**********************!\
  !*** ./src/app.js ***!
  \**********************/
    /***/ (module, exports) => {
      const axios = require('axios');

      class AppModule {
        constructor() {
          this.version = '2.0';
          this.name = 'HMR Client App - Enhanced';
          this.state = {
            isRunning: false,
            startTime: null,
            counter: 0,
            features: ['hot-reload', 'real-time-updates', 'websocket-support'],
          };
          this.lastUpdate = new Date().toISOString();
          console.log(
            `📱 ${this.name} v${this.version} initialized with enhanced features`,
          );
        }

        start() {
          this.state.isRunning = true;
          this.state.startTime = new Date();
          console.log(
            `🚀 ${this.name} started at ${this.state.startTime.toISOString()}`,
          );
          console.log('📱 Enhanced features:', this.state.features);
          return this;
        }

        stop() {
          this.state.isRunning = false;
          console.log(`⏹️ ${this.name} stopped`);
          return this;
        }

        increment() {
          this.state.counter++;
          console.log(
            `📊 Counter incremented to: ${this.state.counter} (Enhanced version)`,
          );
          return this.state.counter;
        }

        getStatus() {
          return {
            name: this.name,
            version: this.version,
            isRunning: this.state.isRunning,
            startTime: this.state.startTime,
            counter: this.state.counter,
            features: this.state.features,
            lastUpdate: this.lastUpdate,
            uptime: this.state.startTime
              ? Date.now() - this.state.startTime.getTime()
              : 0,
          };
        }

        async fetchData() {
          try {
            console.log('📡 Fetching enhanced data from API...');
            // Enhanced data fetching with new features
            const response = await axios.get('http://localhost:3000/api/data');
            console.log(
              '✅ Enhanced data fetched successfully:',
              response.data,
            );
            return response.data;
          } catch (error) {
            console.error('❌ Enhanced data fetch failed:', error.message);
            return {
              error: 'Failed to fetch enhanced data',
              version: this.version,
            };
          }
        }

        processData(data) {
          console.log('🔄 Processing enhanced data with new algorithms...');
          return {
            ...data,
            processed: true,
            processedAt: new Date().toISOString(),
            version: this.version,
            enhancedFeatures: this.state.features,
          };
        }
      }

      module.exports = { AppModule };

      console.log('🚀 Enhanced App Module loaded with HMR support');

      if (true) {
        console.log('app.js hot reload has module.hot');
        // HMR self-accept for app module
      }

      // Simulated edit at ' + new Date().toISOString() + '

      /***/
    },
};
exports.runtime = /******/ function (__webpack_require__) {
  // webpackRuntimeModules
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'module-update-hash';
    /******/
  })();
  /******/
  /******/
};
