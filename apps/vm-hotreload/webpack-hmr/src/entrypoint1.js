const state = {
  name: 'Entrypoint 1',
  counter: 0,
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
function greet(name = 'World') {
  return `Hello ${name} from ${state.name}! Counter: ${state.counter}`;
}
function reset() {
  state.counter = 0;
  return 'Counter reset';
}

module.exports = { getName, increment, getCounter, getCreatedAt, greet, reset };

if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => {
    // Optionally reset state or cleanup
    state.counter = 0;
  });
}
