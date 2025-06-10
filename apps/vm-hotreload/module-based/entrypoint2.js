// entrypoint2.js (module-based, no VM awareness)
console.log('🚀 Entrypoint 2 loaded (module-based)');

const state = {
  name: 'Entrypoint 2',
  counter: 100,
  createdAt: new Date().toISOString(),
};

module.exports = {
  getName: () => state.name,
  increment: () => ++state.counter,
  getCounter: () => state.counter,
  getCreatedAt: () => state.createdAt,
  greet: (name = 'Universe') => `Welcome ${name} to ${state.name}!`,
};
