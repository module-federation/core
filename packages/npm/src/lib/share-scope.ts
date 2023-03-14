export const rewriteShareScope = (
  packageName: string,
  existingVersions: string[]
) => {
  return existingVersions.reduce((acc, version) => {
    acc[version] = setUpkgModule(packageName, version);
    return acc;
  }, {} as (typeof __webpack_share_scopes__)[0]);
};

export const setUpkgModule = (
  packageName: string,
  version: string
): (typeof __webpack_share_scopes__)[0][0] => {
  return {
    eager: false,
    from: '@npm/app3',
    get: async () => {
      const moduleFactory = await import(
        /* webpackIgnore: true */ `https://esm.sh/${packageName}@${version}`
      );
      return () => moduleFactory;
    },
    loaded: undefined,
  };
};
