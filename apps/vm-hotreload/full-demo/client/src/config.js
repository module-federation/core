// Application Configuration Module - Hot Reloadable
export class AppConfig {
  constructor() {
    this.version = '1.0.0';
    this.config = {
      apiUrl: 'http://localhost:3000',
      wsUrl: 'ws://localhost:3001',
      pollingInterval: 3000,
      enableHMR: true,
      debugMode: true,
      theme: 'default',
      features: {
        realTimeUpdates: true,
        autoReload: true,
        notifications: true,
      },
    };
    console.log('⚙️ AppConfig initialized');
  }

  load() {
    console.log('📋 Loading application configuration:');
    console.log(`  API URL: ${this.config.apiUrl}`);
    console.log(`  WebSocket URL: ${this.config.wsUrl}`);
    console.log(`  Polling Interval: ${this.config.pollingInterval}ms`);
    console.log(`  HMR Enabled: ${this.config.enableHMR}`);
    console.log(`  Debug Mode: ${this.config.debugMode}`);
    console.log(`  Theme: ${this.config.theme}`);
    console.log(`  Features:`, this.config.features);
    console.log(`  Version: ${this.version}`);
  }

  update(newConfig) {
    console.log('🔄 Updating application configuration...');
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
    console.log(`📝 Config updated: ${key} = ${value}`);
  }

  setApiUrl(url) {
    this.config.apiUrl = url;
    console.log(`🌐 API URL updated: ${url}`);
  }

  setPollingInterval(interval) {
    this.config.pollingInterval = interval;
    console.log(`⏱️ Polling interval updated: ${interval}ms`);
  }

  toggleFeature(feature) {
    if (this.config.features[feature] !== undefined) {
      this.config.features[feature] = !this.config.features[feature];
      console.log(
        `🔧 Feature '${feature}' toggled: ${this.config.features[feature]}`,
      );
    }
  }

  getStats() {
    return {
      version: this.version,
      configKeys: Object.keys(this.config).length,
      featuresEnabled: Object.values(this.config.features).filter(Boolean)
        .length,
      lastLoaded: new Date().toISOString(),
    };
  }
}

// HMR acceptance
if (module.hot) {
  module.hot.accept();
  console.log('🔥 AppConfig module accepts HMR');
}
