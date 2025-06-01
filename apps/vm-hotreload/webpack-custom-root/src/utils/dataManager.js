// Data Manager utility for handling application state
class DataManager {
  constructor() {
    this.data = new Map();
    this.subscribers = new Map();
    this.createdAt = new Date().toISOString();
    this.version = '1.0.0';
  }

  set(key, value) {
    const oldValue = this.data.get(key);
    this.data.set(key, value);

    // Notify subscribers
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach((callback) => {
        callback(value, oldValue, key);
      });
    }

    return this;
  }

  get(key) {
    return this.data.get(key);
  }

  has(key) {
    return this.data.has(key);
  }

  delete(key) {
    const result = this.data.delete(key);
    this.subscribers.delete(key);
    return result;
  }

  clear() {
    this.data.clear();
    this.subscribers.clear();
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      if (this.subscribers.has(key)) {
        this.subscribers.get(key).delete(callback);
      }
    };
  }

  getAll() {
    return Object.fromEntries(this.data);
  }

  size() {
    return this.data.size;
  }

  keys() {
    return Array.from(this.data.keys());
  }

  values() {
    return Array.from(this.data.values());
  }

  getStats() {
    return {
      size: this.size(),
      keys: this.keys(),
      subscriberCount: this.subscribers.size,
      createdAt: this.createdAt,
      version: this.version,
    };
  }
}

module.exports = DataManager;
