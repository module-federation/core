import {
  getModuleFromRegistry,
  loadPendingSharedToRegistrySync,
} from 'mf:remote-module-registry';

// export the placeholder before loading the module: a module that requires
// this one again while it loads (a require cycle) gets the same object
module.exports = getModuleFromRegistry(__MODULE_ID__);
loadPendingSharedToRegistrySync(__MODULE_ID__);
