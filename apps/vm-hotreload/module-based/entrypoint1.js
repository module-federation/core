// entrypoint1.js (module-based, no VM awareness)
console.log('🚀 Entrypoint 1 loaded (module-based)');

const state = {
  name: 'Entrypoint 1',
  counter: 0,
  createdAt: new Date().toISOString(),
};

module.exports = {
  getName: () => state.name,
  increment: () => ++state.counter,
  getCounter: () => state.counter,
  getCreatedAt: () => state.createdAt,
  greet: (name = 'World') =>
    `🔥 HOT RELOADED: Hey ${name}! Iteration ${state.counter}`,
  reset: () => {
    state.counter = 0;
    return 'Counter reset';
  },
};
