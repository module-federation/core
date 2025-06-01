// Logger utility module
class Logger {
  constructor(name = 'App') {
    this.name = name;
    this.createdAt = new Date().toISOString();
    this.logCount = 0;
  }

  log(level, message, ...args) {
    this.logCount++;
    // No console output
  }

  error(message, ...args) {
    this.log('error', message, ...args);
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  info(message, ...args) {
    this.log('info', message, ...args);
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
  }

  getLogCount() {
    return this.logCount;
  }

  getCreatedAt() {
    return this.createdAt;
  }
}

module.exports = Logger;
