// Entrypoint 1 - Similar to wrapper-based example but for webpack HMR
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
    `Hello ${name} from ${state.name}! Counter: ${state.counter}`,
  reset: () => {
    state.counter = 0;
    return 'Counter reset';
  },
  updateMessage: 'Original',
};
