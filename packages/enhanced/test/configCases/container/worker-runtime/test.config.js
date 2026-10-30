module.exports = {
  findBundle() {
    return './main.js';
  },
  moduleScope(scope) {
    scope.Worker = class Worker {
      constructor(url) {
        this.url = url;
      }
    };
  },
};
