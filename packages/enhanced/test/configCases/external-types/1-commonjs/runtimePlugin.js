const createRuntimePlugin = () => {
  return {
    name: 'runtime-plugin',

    init(args) {
      debugger;
      return args;
    },
    // Main entry loading implementation
    async loadEntry({ remoteInfo }) {
      console.log('loadEntry hook triggered', { remoteInfo });
      debugger;
      return {
        get: () => async () => ({}),
        init: async () => {
          return;
        },
      };
    },

    // Error handling hooks
    async errorLoadRemote({ id, error, origin }) {
      console.log('errorLoadRemote hook triggered', { id, error });
      return { id, error, origin };
    },

    async loadEntryError({ origin, uniqueKey }) {
      console.log('loadEntryError hook triggered', { uniqueKey });
      return undefined;
    }
  };
};

module.exports = createRuntimePlugin;
