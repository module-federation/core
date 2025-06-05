// Logger utility module
class Logger {
  constructor(prefix = 'APP') {
    this.prefix = prefix;
    this.logs = [];
    this.createdAt = new Date().toISOString();
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      prefix: this.prefix,
    };

    this.logs.push(logEntry);
    // console.log(`[${timestamp}] [${this.prefix}] [${level}] ${message}`);
  }

  info(message) {
    this.log(message, 'INFO');
  }

  warn(message) {
    this.log(message, 'WARN');
  }

  error(message) {
    this.log(message, 'ERROR');
  }

  debug(message) {
    this.log(message, 'DEBUG');
  }

  getLogs() {
    return this.logs;
  }

  getLogCount() {
    return this.logs.length;
  }

  clearLogs() {
    this.logs = [];
    this.log('Logs cleared', 'INFO');
  }

  getCreatedAt() {
    return this.createdAt;
  }
}

module.exports = Logger;
