module.exports = function () {
  return {
    name: 'custom-plugin-build',
    resolveShare(args) {
      const { shareScopeMap, scope, pkgName, version } = args;

      if (pkgName !== 'react') {
        return args;
      }

      args.resolver = function () {
        shareScopeMap[scope][pkgName][version] = {
          lib: () => {
            let version = '2.3.4';
            return {
              __esModule: true,
              default: () => `This is react ${version}`,
            };
          },
        }; // replace local share scope manually with desired module
        return shareScopeMap[scope][pkgName][version];
      };
      return args;
    },
  };
};
