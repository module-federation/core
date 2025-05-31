const fs = require('fs');
const vm = require('vm');
const path = require('path');

const filename = __filename;
const isInVM = global.__IN_VM_CONTEXT__;

if (isInVM) {
  // In VM context: define state and exports
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
  };
} else {
  // Not in VM: export live getters that delegate to a VM instance
  let vmInstance = null;
  function createVM() {
    const code = fs.readFileSync(filename, 'utf8');
    const context = {
      require,
      module: { exports: {} },
      exports: {},
      __filename: filename,
      __dirname: path.dirname(filename),
      global: { __IN_VM_CONTEXT__: true },
    };
    vm.createContext(context);
    vm.runInContext(code, context, { filename });
    return context.module.exports;
  }
  function getVM() {
    if (!vmInstance) vmInstance = createVM();
    return vmInstance;
  }
  function destroyVM() {
    vmInstance = null;
  }
  const handler = {
    get(_, prop) {
      if (prop === 'destroyVM') return destroyVM;
      return getVM()[prop];
    },
  };
  module.exports = new Proxy({}, handler);
}
