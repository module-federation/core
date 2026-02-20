module.exports = {
  moduleScope(scope) {
    scope.REMOTE_ESM_PKG = {
      get(module) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(() => ({
              __esModule: true,
              default: function remoteFunction() {
                return 'remote default export';
              },
              namedExport: 'remote named export',
            }));
          }, 100);
        });
      },
    };
  },
};
