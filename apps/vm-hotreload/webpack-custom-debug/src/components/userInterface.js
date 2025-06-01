class UserInterface {
  constructor(name = 'DefaultUI') {
    this.name = name;
    this.state = {
      theme: 'light',
      isVisible: true,
      activeUsers: 0,
    };
    this.notifications = [];
    this.createdAt = new Date().toISOString();
  }

  setTheme(theme) {
    this.state.theme = theme;
  }

  getTheme() {
    return this.state.theme;
  }

  setVisible(visible) {
    this.state.isVisible = visible;
  }

  isVisible() {
    return this.state.isVisible;
  }

  setActiveUsers(count) {
    this.state.activeUsers = count;
  }

  getActiveUsers() {
    return this.state.activeUsers;
  }

  addNotification(message, type = 'info') {
    const notification = {
      id: `notif_${Date.now()}`,
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    this.notifications.push(notification);

    // Keep only last 10 notifications
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(-10);
    }

    return notification.id;
  }

  getNotificationCount() {
    return this.notifications.length;
  }

  getName() {
    return this.name;
  }

  getState(key = null) {
    if (key) {
      return this.state[key];
    }
    return { ...this.state };
  }
}

module.exports = UserInterface;
