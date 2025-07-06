// User Interface component for managing UI state and interactions
const Logger = require('../utils/logger');
const DataManager = require('../utils/dataManager');

class UserInterface {
  constructor(name = 'DefaultUI') {
    this.name = name;
    this.logger = new Logger(`UI-${name}`);
    this.dataManager = new DataManager();
    this.state = {
      isVisible: true,
      theme: 'light',
      language: 'en',
      notifications: [],
      activeUsers: 0,
    };
    this.createdAt = new Date().toISOString();
    this.version = '2.1.0';

    this.logger.info(`UserInterface '${this.name}' initialized`);
    this.initializeState();
  }

  initializeState() {
    Object.keys(this.state).forEach((key) => {
      this.dataManager.set(key, this.state[key]);
    });
  }

  setState(key, value) {
    if (key in this.state) {
      this.state[key] = value;
      this.dataManager.set(key, value);
      this.logger.info(`State updated: ${key} = ${JSON.stringify(value)}`);
    } else {
      this.logger.warn(`Unknown state key: ${key}`);
    }
  }

  getState(key) {
    return key ? this.state[key] : { ...this.state };
  }

  toggleVisibility() {
    this.setState('isVisible', !this.state.isVisible);
    return this.state.isVisible;
  }

  setTheme(theme) {
    if (['light', 'dark', 'auto'].includes(theme)) {
      this.setState('theme', theme);
    } else {
      this.logger.error(`Invalid theme: ${theme}`);
    }
  }

  addNotification(message, type = 'info') {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    const notifications = [...this.state.notifications, notification];
    this.setState('notifications', notifications);
    this.logger.info(`Notification added: ${message}`);

    return notification.id;
  }

  removeNotification(id) {
    const notifications = this.state.notifications.filter((n) => n.id !== id);
    this.setState('notifications', notifications);
    this.logger.info(`Notification removed: ${id}`);
  }

  clearNotifications() {
    this.setState('notifications', []);
    this.logger.info('All notifications cleared');
  }

  setActiveUsers(count) {
    this.setState('activeUsers', Math.max(0, count));
  }

  incrementActiveUsers() {
    this.setActiveUsers(this.state.activeUsers + 1);
  }

  decrementActiveUsers() {
    this.setActiveUsers(this.state.activeUsers - 1);
  }

  render() {
    const output = {
      component: this.name,
      version: this.version,
      state: this.getState(),
      stats: this.dataManager.getStats(),
      logs: this.logger.getLogs().slice(-5), // Last 5 logs
      createdAt: this.createdAt,
      renderedAt: new Date().toISOString(),
    };

    this.logger.debug('Component rendered');
    return output;
  }

  destroy() {
    this.logger.info(`UserInterface '${this.name}' destroyed`);
    this.dataManager.clear();
    this.logger.clearLogs();
  }

  // Utility methods
  getName() {
    return this.name;
  }

  getVersion() {
    return this.version;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getNotificationCount() {
    return this.state.notifications.length;
  }

  getActiveUsers() {
    return this.state.activeUsers;
  }
}

module.exports = UserInterface;
