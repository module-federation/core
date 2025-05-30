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
  module.hot.accept();
  module.hot.dispose(() => {
    // Optionally reset state or cleanup
    state.counter = 100;
  });
}
