const createRuntimePlugin = () => {
  return {
    name: 'runtime-plugin',

    init(args) {
      return args;
    },
    // Main entry loading implementation
    async loadEntry({ remoteInfo }) {
      if (!remoteInfo.externalType?.startsWith('commonjs')) {
        return undefined;
      }
      try {
        // Always use __non_webpack_require__ for loading modules
        return __non_webpack_require__(remoteInfo.entry);
      } catch (error) {
        console.error('Error loading entry:', error);
        return undefined;
      }
    },
  };
};

module.exports = createRuntimePlugin;
