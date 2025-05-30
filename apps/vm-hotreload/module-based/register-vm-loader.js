// register-vm-loader.js - Hook into Node's require system for transparent VM loading
const Module = require('module');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const vmInstances = new Map();
const hotReloadPaths = new Set();

// Store original require extension
const originalJsExtension = Module._extensions['.js'];

// Override .js extension handler for hot-reloadable modules
Module._extensions['.js'] = function (module, filename) {
  // Check if this file should be hot-reloadable
  if (
    !Array.from(hotReloadPaths).some((pattern) => filename.includes(pattern))
  ) {
    // Use original handler for non-hot-reloadable files
    return originalJsExtension.apply(this, arguments);
  }

  console.log(`🔥 Hot-reloadable module detected: ${path.basename(filename)}`);

  // Create getter-based exports
  const createHotReloadableExports = () => {
    // Get or create VM instance
    const getVM = () => {
      if (!vmInstances.has(filename)) {
        console.log(`🔄 Creating VM for ${path.basename(filename)}`);

        const fileContent = fs.readFileSync(filename, 'utf8');

        // Run in VM context with access to Node globals
        const vmExports = vm.runInThisContext(
          `
          (function(require) {
            const module = { exports: {} };
            const exports = module.exports;
            const __filename = '${filename.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';
            const __dirname = '${path.dirname(filename).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';
            
            ${fileContent}
            
            return module.exports;
          })
        `,
          {
            filename: path.basename(filename),
          },
        )(require);

        vmInstances.set(filename, vmExports);
      }
      return vmInstances.get(filename);
    };

    // Get initial exports to know what properties to create
    const initialVM = getVM();
    const hotExports = {};

    // Create live bindings via getters
    for (const key in initialVM) {
      if (initialVM.hasOwnProperty(key)) {
        Object.defineProperty(hotExports, key, {
          get() {
            return getVM()[key];
          },
          enumerable: true,
          configurable: true,
        });
      }
    }

    return hotExports;
  };

  // Set the module exports
  module.exports = createHotReloadableExports();
};

// API to register paths for hot reloading
function registerHotReload(patterns) {
  if (Array.isArray(patterns)) {
    patterns.forEach((p) => hotReloadPaths.add(p));
  } else {
    hotReloadPaths.add(patterns);
  }
}

// API to destroy VM instances
function destroyVM(filename) {
  if (filename) {
    const absolutePath = path.resolve(filename);
    if (vmInstances.has(absolutePath)) {
      console.log(`💥 Destroying VM for ${path.basename(absolutePath)}`);
      vmInstances.delete(absolutePath);
    }
  } else {
    console.log('💥 Destroying all VMs');
    vmInstances.clear();
  }
}

module.exports = {
  registerHotReload,
  destroyVM,
  destroyAll: () => destroyVM(),
};
