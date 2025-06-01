// Data Manager utility for handling application state
class DataManager {
  constructor() {
    this.data = new Map();
    this.createdAt = new Date().toISOString();
  }

  set(key, value) {
    this.data.set(key, value);
    return this;
  }

  get(key) {
    return this.data.get(key);
  }

  has(key) {
    return this.data.has(key);
  }

  delete(key) {
    return this.data.delete(key);
  }

  clear() {
    this.data.clear();
  }

  size() {
    return this.data.size;
  }

  keys() {
    return Array.from(this.data.keys());
  }
}

module.exports = DataManager;
