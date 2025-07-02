const state = {
  name: 'Entrypoint 2',
  counter: 100,
  createdAt: new Date().toISOString(),
};

function getName() {
  return state.name;
}
function increment() {
  return ++state.counter;
}
function getCounter() {
  return state.counter;
}
function getCreatedAt() {
  return state.createdAt;
}
function greet(name = 'Universe') {
  return `Greetings ${name} from ${state.name}! Counter: ${state.counter}`;
}
function reset() {
  state.counter = 100;
  return 'Counter reset to 100';
}

module.exports = { getName, increment, getCounter, getCreatedAt, greet, reset };

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
