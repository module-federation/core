const path = __non_webpack_require__('path');

module.exports = function () {
  return {
    name: 'proxy-shared-asset',
    loadEntry: ({ remoteInfo }) => {
      const { entry, entryGlobalName } = remoteInfo;

      if (entry.includes('PUBLIC_PATH')) {
        const relativePath = entry.replace('PUBLIC_PATH', '');
        globalThis[entryGlobalName] = __non_webpack_require__(
          path.join(__dirname, relativePath),
        )[entryGlobalName];
        return globalThis[entryGlobalName];
      }
    },
  };
};
