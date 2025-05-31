// Entrypoint 2 - Similar to wrapper-based example but for webpack HMR
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
  reset: () => {
    state.counter = 100;
    return 'Counter reset to 100';
  },
  updateMessage: 'Original',
};

if (module.hot) {
  console.log('entrypoint2.js hot reload has module.hot');
  // --- HMR self-accept pattern (commented out) ---
  // If you want this module to handle its own hot updates (and NOT notify the parent),
  // uncomment the following line. This is useful for modules with only side effects or
  // when you want to handle HMR logic locally. If self-accept is enabled, the parent
  // will NOT be notified of updates to this module, and parent HMR handlers will not run.
  // module.hot.accept();
  //
  // In this demo, we want the parent to be notified so it can re-require and refresh state.
  // -----------------------------------------------
  // If you want to preserve state, use dispose/data:
  // module.hot.dispose(data => { data.counter = state.counter; });
  // if (module.hot.data) { state.counter = module.hot.data.counter || 100; }
}
