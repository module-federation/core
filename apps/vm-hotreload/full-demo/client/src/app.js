// Main Application Module - Hot Reloadable
const axios = require('axios');

class AppModule {
  constructor() {
    this.version = '1.0.0';
    this.name = 'HMR Client App';
    this.state = {
      isRunning: false,
      startTime: null,
      counter: 0,
    };

    console.log(`📱 ${this.name} v${this.version} initialized`);
  }

  start() {
    this.state.isRunning = true;
    this.state.startTime = new Date();
    console.log(
      `🚀 ${this.name} started at ${this.state.startTime.toISOString()}`,
    );
    return this;
  }

  stop() {
    this.state.isRunning = false;
    console.log(`⏹️ ${this.name} stopped`);
    return this;
  }

  increment() {
    this.state.counter++;
    console.log(`📊 Counter incremented to: ${this.state.counter}`);
    return this.state.counter;
  }

  getStatus() {
    return {
      name: this.name,
      version: this.version,
      isRunning: this.state.isRunning,
      startTime: this.state.startTime,
      counter: this.state.counter,
      uptime: this.state.startTime
        ? Date.now() - this.state.startTime.getTime()
        : 0,
    };
  }

  async fetchData() {
    try {
      console.log('📡 Fetching data from API...');
      // This would typically fetch from the backend
      return {
        timestamp: new Date().toISOString(),
        data: 'Sample data from app module',
        counter: this.state.counter,
      };
    } catch (error) {
      console.error('❌ Error fetching data:', error.message);
      throw error;
    }
  }

  update(newModule) {
    console.log('🔄 Updating app module...');
    // Preserve state during hot reload
    if (newModule) {
      newModule.state = this.state;
    }
    return newModule || this;
  }
}

// HMR acceptance
if (module.hot) {
  module.hot.accept(() => {
    console.log('♻️ App module hot reloaded!');
  });

  module.hot.dispose((data) => {
    console.log('🗑️ App module disposing...');
    data.state = this.state;
  });
}

module.exports = { AppModule };
